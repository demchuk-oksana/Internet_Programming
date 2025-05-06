<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "userauth";

// Підключення до БД
$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die("Помилка з'єднання: " . $conn->connect_error);
}

$message = '';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $login = $_POST["login"] ?? '';
    $password = $_POST["password"] ?? '';

    // Перевірка чи вже існує такий логін
    $stmt = $conn->prepare("SELECT id FROM users WHERE login = ?");
    $stmt->bind_param("s", $login);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $message = "❌ Користувач із таким логіном вже існує.";
    } else {
        $stmt->close();
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (login, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $login, $hashedPassword);

        if ($stmt->execute()) {
            $message = "✅ Реєстрація успішна!";
        } else {
            $message = "❌ Помилка при збереженні користувача.";
        }
    }

    $stmt->close();
}
$conn->close();
?>

<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Реєстрація</title>
</head>
<body>
    <h2>Реєстрація користувача</h2>
    <form method="post">
        <label>Логін:</label><br>
        <input type="text" name="login" required><br><br>

        <label>Пароль:</label><br>
        <input type="password" name="password" required><br><br>

        <input type="submit" value="Зареєструватися">
    </form>

    <?php if ($message): ?>
        <p><strong><?= htmlspecialchars($message) ?></strong></p>
    <?php endif; ?>

    <p><a href="login.php">Уже маєш акаунт? Увійди тут</a></p>
</body>
</html>

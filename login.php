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

    $stmt = $conn->prepare("SELECT password FROM users WHERE login = ?");
    $stmt->bind_param("s", $login);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($hashedPassword);
        $stmt->fetch();

        if (password_verify($password, $hashedPassword)) {
            $message = "✅ Авторизація пройдена. Ласкаво просимо, $login!";
        } else {
            $message = "❌ Неправильний пароль.";
        }
    } else {
        $message = "❌ Користувача не знайдено.";
    }

    $stmt->close();
}
$conn->close();
?>

<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Авторизація</title>
</head>
<body>
    <h2>Вхід користувача</h2>
    <form method="post">
        <label>Логін:</label><br>
        <input type="text" name="login" required><br><br>

        <label>Пароль:</label><br>
        <input type="password" name="password" required><br><br>

        <input type="submit" value="Увійти">
    </form>

    <?php if ($message): ?>
        <p><strong><?= htmlspecialchars($message) ?></strong></p>
    <?php endif; ?>

    <p><a href="register.php">Немає акаунта? Зареєструйся тут</a></p>
</body>
</html>

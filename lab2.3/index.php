<?php
// Use cookies only for the current session
session_start();
session_set_cookie_params(0);

// Initialize variables (not using session persistence)
$range = 1000;
$operations = [];
$num1 = null;
$num2 = null;
$operator = null;
$correctAnswer = null;
$currentAnswer = '';
$message = '';
$showHint = false;

// Get values from POST or session as needed
if (isset($_SESSION['range'])) $range = $_SESSION['range'];
if (isset($_SESSION['operations'])) $operations = $_SESSION['operations'];
if (isset($_SESSION['num1'])) $num1 = $_SESSION['num1'];
if (isset($_SESSION['num2'])) $num2 = $_SESSION['num2'];
if (isset($_SESSION['operator'])) $operator = $_SESSION['operator'];
if (isset($_SESSION['correctAnswer'])) $correctAnswer = $_SESSION['correctAnswer'];
if (isset($_SESSION['currentAnswer'])) $currentAnswer = $_SESSION['currentAnswer'];
if (isset($_SESSION['message'])) $message = $_SESSION['message'];
if (isset($_SESSION['showHint'])) $showHint = $_SESSION['showHint'];

// Check if the message should be reset
if (isset($_SESSION['message_timestamp'])) {
    $messageTimeout = 2; // Message display time in seconds
    if (time() - $_SESSION['message_timestamp'] > $messageTimeout) {
        $message = '';
        unset($_SESSION['message']);
        unset($_SESSION['message_timestamp']);
    }
}

// Function to generate a new math problem
function generateProblem($range, $operations) {
    if (empty($operations)) {
        return array(null, null, null, null);
    }
    
    $num1 = rand(0, $range - 1);
    $num2 = rand(0, $range - 1);
    $operator = $operations[array_rand($operations)];
    
    // Make sure we don't divide by zero
    while ($operator === '/' && $num2 == 0) {
        $num2 = rand(0, $range - 1);
    }
    
    // Calculate the correct answer
    switch ($operator) {
        case '+':
            $correctAnswer = $num1 + $num2;
            break;
        case '-':
            $correctAnswer = $num1 - $num2;
            break;
        case '*':
            $correctAnswer = $num1 * $num2;
            break;
        case '/':
            $correctAnswer = round(($num1 / $num2) * 100) / 100;
            break;
        default:
            $correctAnswer = null;
    }
    
    return array($num1, $num2, $operator, $correctAnswer);
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle range selection
    if (isset($_POST['setRange'])) {
        $newRange = intval($_POST['setRange']);
        if ($newRange === $range) {
            $range = 1000; // Reset if clicking the same range
        } else {
            $range = $newRange;
        }
        // Regenerate problem when range changes
        list($num1, $num2, $operator, $correctAnswer) = generateProblem($range, $operations);
        $currentAnswer = '';
        $showHint = false;
    }

    // Handle operation selection
    if (isset($_POST['setOperation'])) {
        $operation = $_POST['setOperation'];
        $index = array_search($operation, $operations);
        
        if ($index !== false) {
            // Remove the operation if it's already set
            array_splice($operations, $index, 1);
        } else {
            // Add the operation
            $operations[] = $operation;
        }
        
        // Regenerate problem when operations change
        list($num1, $num2, $operator, $correctAnswer) = generateProblem($range, $operations);
        $currentAnswer = '';
        $showHint = false;
    }

    // Handle answer submission
    if (isset($_POST['submitAnswer'])) {
        $userAnswer = $_POST['userAnswer'];
        
        if ((float)$userAnswer == (float)$correctAnswer) {
            $message = "Correct!";
            // Generate a new problem immediately
            list($num1, $num2, $operator, $correctAnswer) = generateProblem($range, $operations);
            $currentAnswer = '';
            $showHint = false;
        } else {
            $message = "Wrong! Try again.";
        }
        
        // Set the message timestamp for auto-expiry
        $_SESSION['message_timestamp'] = time();
    }

    // Handle hint request
    if (isset($_POST['showHint'])) {
        $showHint = true;
    }
    
    // Handle number buttons
    if (isset($_POST['numButton'])) {
        $value = $_POST['numButton'];
        
        if ($value === 'bck') {
            $currentAnswer = substr($currentAnswer, 0, -1);
        } else {
            $currentAnswer .= $value;
        }
    }
}

// Generate an initial problem if needed
if ($num1 === null || $num2 === null || $operator === null) {
    list($num1, $num2, $operator, $correctAnswer) = generateProblem($range, $operations);
}

// Save current state to session (just for the current page load)
$_SESSION['range'] = $range;
$_SESSION['operations'] = $operations;
$_SESSION['num1'] = $num1;
$_SESSION['num2'] = $num2;
$_SESSION['operator'] = $operator;
$_SESSION['correctAnswer'] = $correctAnswer;
$_SESSION['currentAnswer'] = $currentAnswer;
$_SESSION['message'] = $message;
$_SESSION['showHint'] = $showHint;
?>

<!DOCTYPE html> 
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mathematical trainer</title> 
    <link rel="stylesheet" href="style.css">
    <!-- Add meta refresh to automatically reload the page and clear the message -->
    <?php if (!empty($message)): ?>
    <meta http-equiv="refresh" content="2;url=<?php echo $_SERVER['PHP_SELF']; ?>">
    <?php endif; ?>
</head>
<body>
    <div class="text_block">
        <div class="header">
            Math Trainer
        </div>
        <div class="text">
            Range:
        </div>
        <div id="range-buttons">
            <form method="post" style="display: inline;">
                <button type="submit" name="setRange" value="10" class="button <?php echo $range == 10 ? 'active' : ''; ?>">0-10</button>
            </form>
            <form method="post" style="display: inline;">
                <button type="submit" name="setRange" value="20" class="button <?php echo $range == 20 ? 'active' : ''; ?>">0-20</button>
            </form>
            <form method="post" style="display: inline;">
                <button type="submit" name="setRange" value="100" class="button <?php echo $range == 100 ? 'active' : ''; ?>">0-100</button>
            </form>
            <form method="post" style="display: inline;">
                <button type="submit" name="setRange" value="150" class="button <?php echo $range == 150 ? 'active' : ''; ?>">0-150</button>
            </form>
        </div>
        <div class="text">
            Operations:
        </div>
        <div id="operand-buttons">
            <form method="post" style="display: inline;">
                <button type="submit" name="setOperation" value="+" class="button <?php echo in_array('+', $operations) ? 'active' : ''; ?>">&plus;</button>
            </form>
            <form method="post" style="display: inline;">
                <button type="submit" name="setOperation" value="-" class="button <?php echo in_array('-', $operations) ? 'active' : ''; ?>">&minus;</button>
            </form>
            <form method="post" style="display: inline;">
                <button type="submit" name="setOperation" value="*" class="button <?php echo in_array('*', $operations) ? 'active' : ''; ?>">&times;</button>
            </form>
            <form method="post" style="display: inline;">
                <button type="submit" name="setOperation" value="/" class="button <?php echo in_array('/', $operations) ? 'active' : ''; ?>">&divide;</button>
            </form>
        </div>
        <div id="expression" class="expr_block">
            <div id="num1" style="display: flex; align-items: center; margin: 5px 5px;">
                <?php echo $num1 !== null ? $num1 : ''; ?>
            </div>
            <div id="operator" style="display: flex; align-items: center;">
                <?php 
                    if ($operator !== null) {
                        switch ($operator) {
                            case '+': echo '+'; break;
                            case '-': echo '-'; break;
                            case '*': echo '×'; break;
                            case '/': echo '÷'; break;
                        }
                    }
                ?>
            </div>
            <div id="num2" style="display: flex; align-items: center; margin: 5px 5px;">
                <?php echo $num2 !== null ? $num2 : ''; ?>
            </div>
            <div id="eq" style="display: flex; align-items: center; margin: 5px 5px;">
                <?php echo ($num1 !== null && !empty($operations)) ? '=' : ''; ?>
            </div>
            <form method="post" style="display: inline;">
                <input type="text" id="answer" name="userAnswer" style="border-color: #0f5285; border-radius: 5px;" value="<?php echo $currentAnswer; ?>" readonly>
            </form>
            <form method="post" style="display: inline;">
                <button type="submit" name="showHint" class="button" id="hint">
                    <?php echo ($showHint && $correctAnswer !== null) ? $correctAnswer : '???'; ?>
                </button>
            </form>
        </div>
        <div>
            <form method="post">
                <input type="hidden" name="userAnswer" value="<?php echo $currentAnswer; ?>">
                <button type="submit" name="submitAnswer" class="submit_button" id="result">
                    <?php echo !empty($message) ? $message : 'Submit'; ?>
                </button>
            </form>
        </div>
        <div id="numbers" style="display:grid; margin-bottom: 10px;">
            <?php
            $numButtons = [
                ['1', 1, 1], ['2', 1, 2], ['3', 1, 3],
                ['4', 2, 1], ['5', 2, 2], ['6', 2, 3],
                ['7', 3, 1], ['8', 3, 2], ['9', 3, 3],
                ['.', 4, 1], ['0', 4, 2], ['bck', 4, 3]
            ];
            
            foreach ($numButtons as $btn) {
                list($value, $row, $col) = $btn;
                $displayValue = $value === 'bck' ? '⟨' : $value;
                echo '<form method="post" style="grid-row:' . $row . ';grid-column:' . $col . ';">
                        <input type="hidden" name="userAnswer" value="' . $currentAnswer . '">
                        <button type="submit" name="numButton" value="' . $value . '" class="button num_button">' . $displayValue . '</button>
                      </form>';
            }
            ?>
        </div>
    </div>
</body>
</html>
<?php
   
?>
<?php
// Function to calculate BMI
function calculateBMI($weight, $height) {
    // Convert height from cm to meters
    $heightMeters = $height / 100;
    // Calculate BMI
    return $weight / ($heightMeters * $heightMeters);
}

// Function to validate age for blood donation eligibility (must be 18+)
function validateAge($age) {
    return $age >= 18;
}

// Function to validate weight for blood donation eligibility (must be >= 50 kg)
function validateWeight($weight) {
    return $weight >= 50;
}

// Function to validate height for blood donation eligibility (must be >= 150 cm)
function validateHeight($height) {
    return $height >= 100;
}

// Function to validate blood donation eligibility
function validateBloodDonationEligibility($age, $weight, $height) {
    // Calculate BMI
    $bmi = calculateBMI($weight, $height);
    // Validate age, weight, and height for blood donation eligibility
    $isEligible = validateAge($age) && validateWeight($weight) && validateHeight($height) && $bmi >= 18.5 && $bmi <= 30;
    return $isEligible;
}

// Function to validate name
function validateName($name) {
    $minLength = 4;
    $maxLength = 20;
    return strlen($name) >= $minLength && strlen($name) <= $maxLength;
}

// Function to validate mobile number
function validateMobile($mobile) {
    // Remove non-numeric characters
    $numericMobile = preg_replace('/\D/', '', $mobile);
    return strlen($numericMobile) === 10;
}

// Function to validate email
function validateEmail($email) {
    // Regular expression to match email format
    $emailRegex = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
    return preg_match($emailRegex, $email);
}

// Function to validate blood group
function validateBloodGroup($bloodGroup) {
    $validBloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    return in_array(strtoupper($bloodGroup), $validBloodGroups);
}

// Function to validate the form
function validateForm() {
    $name = $_POST['name'];
        $email = $_POST['email'];
        $mobile = $_POST['phone'];
        $bloodGroup = $_POST['bloodgroup'];
        $age = $_POST['age'];
        $lastdonated = $_POST['lastdonated'];
        $weight = $_POST['weight'];
        $height = $_POST['height'];
        $state = $_POST['state'];
        $district = $_POST['district'];
        $landmark = $_POST['landmark'];

    if (!validateName($name)) {
        echo "Name must be between 4 and 20 characters long.";
        return false;
    }

    if (!validateMobile($mobile)) {
        echo "Mobile number must be 10 digits long.";
        return false;
    }

    if (!validateEmail($email)) {
        echo "Invalid email format.";
        return false;
    }

    if (!validateBloodGroup($bloodGroup)) {
        echo "Invalid blood group.";
        return false;
    }

    if (!validateAge($age)) {
        echo "You are underage for blood donation.";
        return false;
    }

    if (!validateWeight($weight)) {
        echo "Your weight is below the required limit for blood donation.";
        return false;
    }

    if (!validateHeight($height)) {
        echo "Your height is below the required limit for blood donation.";
        return false;
    }

    // Validate blood donation eligibility
    // $isEligible = validateBloodDonationEligibility($age, $weight, $height);
    // if (!$isEligible) {
    //     echo "You are not eligible to donate blood.";
    //     return false;
    // }

    // If all validations pass, return true to submit the form
    return true;
}

// Validate the form if it's submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (validateForm()) {
        $servername = "localhost";
        $username = "root"; 
        $password = "";
        $dbname = "blooddonation";
        $conn=mysqli_connect($servername,$username,$password,$dbname);
        if(!$conn){
            die('Could not Connect My Sql:' .mysql_error());
        }
        $name = $_POST['name'];
        $email = $_POST['email'];
        $phone = $_POST['phone'];
        $bloodgroup = $_POST['bloodgroup'];
        $age = $_POST['age'];
        $lastdonated = $_POST['lastdonated'];
        $weight = $_POST['weight'];
        $height = $_POST['height'];
        $state = $_POST['state'];
        $district = $_POST['district'];
        $landmark = $_POST['landmark'];
        $sql = "INSERT INTO donors (name,email,phone,bloodgroup,age,lastdonated,weight,height,state,district,landmark) VALUES ('$name','$email','$phone','$bloodgroup','$age','$lastdonated','$weight','$height','$state','$district','$landmark')";
        if(mysqli_query($conn, $sql)){
            echo "<script>alert('Details are stored. We will be in touch with you.');window.location.href='/mini-2/index.html';</script>";
        } else{
            echo "Request Submission Failed";
        }
        mysqli_close($conn);
    }
}
?>

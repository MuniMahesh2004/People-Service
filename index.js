const { eachLimit } = require('async');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const session = require('express-session');  // Import express-session
const app = express();

// Set up session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // Session cookie valid for 1 day
}));

// Middleware to set no-cache headers
// Middleware to set no-cache headers
const noCache = (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
};

// Apply the noCache middleware to all routes
app.use(noCache);

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Middleware for parsing incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (like CSS, JS, and images)
app.use(express.static(path.join(__dirname, "./views")));

// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:Password123@cluster0.9ikks.mongodb.net/singup", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => console.log('MongoDB connection error:', err));

// REGISTER SCHEMA
const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    resetToken: String, // Add resetToken field
    resetTokenExpiration: Date // Add resetTokenExpiration field
});

// REGISTER MODEL CREATION
const User = mongoose.model('User', registrationSchema);

// DONOR SCHEMA
const DonarSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    bloodgroup: { type: String, required: true },
    lastdonated: { type: Date },
    weight: { type: Number },
    height: { type: Number },
    state: { type: String, required: true },
    city: { type: String }
});

// DONOR MODEL CREATION
const Donar = mongoose.model('Donar', DonarSchema);

// MAIN LOAD PAGE
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html')); // Corrected path for index.html
});

// USERNAME DISPLAY
let username = "";

// ROUTE FOR REGISTER
app.get('/register', (req, res) => {
    res.render('register'); // Renders 'views/register.ejs'
});

// POST FOR REGISTER
app.post('/register', async (req, res) => {
    try {
        const { email, username, password, confirmpassword } = req.body;

        // Check if the user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        // Validate if password and confirm password match
        if (password !== confirmpassword) {
            return res.status(400).json({ message: 'Passwords do not match!' });
        }

        // If the user does not exist, proceed with saving the user
        await saveUser(req, res);

        // Respond with a success message
        return res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log('Error during registration:', error);
        return res.status(400).json({ error: 'Registration failed' });
    }
});

// FUNCTION FOR REGISTER STORAGE
async function saveUser(req, res) {
    const { username, email, password } = req.body;

    const data = new User({
        name: username,
        email: email,
        password: password
    });

    try {
        // Save user data
        await data.save();
        console.log('User saved successfully!');
    } catch (err) {
        console.log('Error saving user:', err);
        return res.status(500).json({ message: 'Error saving user' });
    }
}

// ROUTE FOR SIGN
app.get('/sign', (req, res) => {
    if (req.session.username) {
        return res.redirect('/home'); // Redirect to home if already logged in
    }
    res.render('sign');
});

// POST FOR SIGN
app.post('/sign', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // User not found
            return res.status(400).json({ message: 'em' });
        }

        // Verify password
        if (user.password === password) {
            username = user.name;
            req.session.username = user.name;
            return res.status(200).json({ message: 'User sign-in successfully' });
        } else {
            return res.status(400).json({ message: 'pw' });
        }
    } catch (error) {
        console.log('Error during sign-in:', error);
        return res.status(500).json({ message: 'An error occurred during sign-in.' });
    }
});

// FORGOT PASSWORD ROUTE (renders the form to input the email)
app.get('/forget-password', (req, res) => {
    res.render('forget-password');
});

// POST: Generate a reset token and send it via email
app.post('/forget-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User with that email does not exist.' });
        }
        // Generate a token
        const token = crypto.randomBytes(20).toString('hex');

        // Set the token and expiration time
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        // Send reset email using nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'munirs1920108606@gmail.com', // Your email
                pass: 'cizq kgev wovs nckc'         // Your email password
            }
        });

        const mailOptions = {
            from: 'muni9640020@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            text: `You requested a password reset. Please click the link below to reset your password:\n\n
                http://localhost:3000/reset-password/${token}\n\n
                If you did not request this, please ignore this email.`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset email sent.' });

    } catch (error) {
        console.error('Error while sending email:', error);
        res.status(500).json({ message: 'An error occurred. Try again later.' });
    }
});

// RESET PASSWORD ROUTE (when the user clicks the link in the email)
app.get('/reset-password/:token', async (req, res) => {
    const token = req.params.token;
    console.log(token);
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        res.render('reset-password', { token });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

// POST: Reset the password
// POST: Reset the password
app.post('/reset-password/:token', async (req, res) => {
    const { password, confirmpassword } = req.body;
    const token = req.params.token;

    if (!password || !confirmpassword) {
        return res.status(400).json({ message: 'Please provide both password and confirm password.' });
    }

    if (password !== confirmpassword) {
        return res.status(400).json({ message: 'Passwords do not match!' });
    }

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Update the user's password
        user.password = password; // Ideally hash the password before saving
        user.resetToken = null; // Clear the reset token
        user.resetTokenExpiration = null; // Clear the expiration

        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});


// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.username) {
        next(); // User is authenticated
    } else {
        res.redirect('/sign'); // User is not authenticated
    }
};

// Example usage of the middleware on a protected route
app.get('/home', isAuthenticated, (req, res) => {
    res.render('home', { username: req.session.username });
});


// ROUTE FOR SIGNOUT (Destroy session)
app.get('/signout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error during sign-out:', err);
            return res.status(500).json({ message: 'Error signing out' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        // Redirect to a page that enforces no-cache
        // console("signout");
        res.redirect('/'); // Redirect to a new route
    });
});


// ROUTE FOR DONOR
app.get('/donar', (req, res) => {
    res.render('donar');
});
//POST FOR DONAR
app.post('/donar', async (req, res) => {
    try {
        await saveDetails(req); // Call async saveUser function
        return res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log('Error during registration:', error);
        return res.status(400).json({ error: 'Registration failed' });
    }
});
//FUNCTION FOR DONAR DEATAILS
//name,mobile,email,bloodGroup,weight
async function saveDetails(req) {
    const data = new Donar({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        age: req.body.age,
        bloodgroup: req.body.bloodgroup,
        weight: req.body.weight,
        state: req.body.state,
        city: req.body.city
    });
    try {
        await data.save(); // Await the save operation
        console.log('Donor details saved successfully!');
    } catch (err) {
        console.log('Error saving donor details:', err);
    }
}
// ROUTE FOR RECEIVER
app.get('/receiver',(req,res)=>{
    res.render('receiver');
})
app.post('/receiver', async (req, res) => {
    const { state, city, bloodgroup } = req.body;

    try {
        let query = {};

        if (state) query.state = state;
        if (city) query.city = city;
        if (bloodgroup) query.bloodgroup = bloodgroup;

        // Find donors that match the filters
        const donors = await Donar.find(query);

        // Send the list of donors as JSON response
        res.json({ donors });
    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).send('An error occurred');
    }
});
// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

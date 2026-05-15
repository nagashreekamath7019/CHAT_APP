import User from "../Models/userModels.js"
import bcryptjs from 'bcryptjs'
import jwtwebToken from '../utils/jwtwebToken.js'


export const userRegister = async (req, res) => {
    try {
        const { fullname, username, email, gender, password, profilepic } = req.body;
        const user = await User.findOne({
            $or: [{ username }, { email }]
        });
        if (user) return res.status(400).send({ success: false, message: "Username or Email Already Exist!.. " })
        const hashPassword = bcryptjs.hashSync(password, 10);
        const profileBoy = profilepic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        const profileGirl = profilepic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;


        const newUser = new User({
            fullname,
            username,
            email,
            gender,
            password: hashPassword,
            profilepic: gender === "male" ? profileBoy : profileGirl
        })

        if (newUser) {
            await newUser.save();
            jwtwebToken(newUser._id, res)
            return res.status(201).send({
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                profilepic: newUser.profilepic,
                email: newUser.email,
            });
        } else {
            res.status(500).send({ success: false, message: "Invalid User Data" })
        }

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        })
        console.log(error);

    }
}

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) { return res.status(400).send({ success: false, message: "Email Doesn't Exist. Please Register" }) }
        const comparePass = bcryptjs.compareSync(password, user.password || "");
        if (!comparePass) { return res.status(500).send({ success: false, message: "Email or Password doesn't match" }) }

        jwtwebToken(user._id, res);

        res.status(200).send({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            profilepic: user.profilepic,
            email: user.email,
            gender: user.gender,
            success: true,
            message: "Successfully Logged in"
        })

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        })
        console.log(error);
    }
}


export const userLogout = async (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0
        })
        res.status(200).send({
            success: true,
            message: "User Logged out"
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        })
        console.log(error);
    }
}

export const updateUsername = async (req, res) => {
    try {
        const { userId, username } = req.body;

        // Check if username is already taken by another user
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ error: "Username already exists!" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username },
            { new: true }
        );

        res.status(200).json({
            message: "Username updated successfully",
            username: updatedUser.username
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateFullname = async (req, res) => {
    try {
        const { userId, fullname } = req.body;

        if (!fullname) return res.status(400).json({ error: "Fullname is required" });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullname },
            { new: true }
        );

        res.status(200).json({
            message: "Fullname updated successfully",
            fullname: updatedUser.fullname
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateGender = async (req, res) => {
    try {
        const { userId, gender } = req.body;

        if (!gender) return res.status(400).json({ error: "Gender is required" });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { gender },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateGender controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const signup = async (req, res) => {
    try {
        const { username, email } = req.body;

        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            // This 400 status triggers the 'toast.error' on the frontend
            return res.status(400).json({ error: "Username or email already exists" });
        }

        // ... save new user logic ...
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const updateProfilePic = async (req, res) => {
    try {
        const { profilepic } = req.body;
        const userId = req.user._id;

        // Backend Safety Check: Calculate string size
        // Base64 strings are ~33% larger than the actual file
        if (profilepic.length > 700000) { 
            return res.status(400).json({ error: "Image data exceeds server limit (500KB approx)" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilepic: profilepic },
            { new: true }
        ).select("-password");

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating profile pic:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

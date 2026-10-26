import jwt from "jsonwebtoken"

const jwtwebToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '1825d'
    })
    res.cookie("jwt", token, {
        maxAge: 5 * 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true
    })
}

export default jwtwebToken
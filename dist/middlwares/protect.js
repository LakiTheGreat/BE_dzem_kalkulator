export default function checkForToken(req, res, next) {
    const bearer = req.headers.authorization;
    // if (!bearer) {
    //   res.status(401).json({ message: 'Not authorized' });
    //   return;
    // }
    // const token = bearer.split(' ')[1];
    try {
        // add token validation here
        // const user = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        console.error(error);
    }
    next();
}
//# sourceMappingURL=protect.js.map
import status from 'http-status';
import prisma from '../../utils/db.js';
export const mockAuth = async (req, res, next) => {
    const userId = Number(req.header('x-user-id'));
    if (!userId)
        res.status(401).json({ error: 'No user ID provided' });
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(status.NOT_FOUND).json({ error: 'User not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=mockAuth.js.map
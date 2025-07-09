import prisma from '../db';
export default async function createNewFruit(req, res, next) {
    const fruit = await prisma.lookup.create({ data: req.body });
}
//# sourceMappingURL=lookup.js.map
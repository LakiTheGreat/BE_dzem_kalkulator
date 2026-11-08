import prisma from '../../utils/db.js';
export const getAllFruitsService = (userId) => prisma.fruit.findMany({
    where: { isDeleted: false, userId },
    orderBy: { label: 'asc' },
});
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Returns label if it is free, otherwise "label (n)" with n = highest used
// suffix + 1 (the plain label counts as 1). Only non-deleted fruits of this
// user are considered.
const findFreeLabel = async (label, userId) => {
    const sameBase = await prisma.fruit.findMany({
        where: { userId, isDeleted: false, label: { startsWith: label } },
        select: { label: true },
    });
    const labels = new Set(sameBase.map((fruit) => fruit.label));
    if (!labels.has(label)) {
        return label;
    }
    const suffixPattern = new RegExp(`^${escapeRegExp(label)} \\((\\d+)\\)$`);
    let highest = 1;
    labels.forEach((existing) => {
        const match = existing.match(suffixPattern);
        if (match)
            highest = Math.max(highest, Number(match[1]));
    });
    return `${label} (${highest + 1})`;
};
export const createFruitService = async (label, userId) => prisma.fruit.create({
    data: { label: await findFreeLabel(label, userId), userId },
});
//# sourceMappingURL=fruit.service.js.map
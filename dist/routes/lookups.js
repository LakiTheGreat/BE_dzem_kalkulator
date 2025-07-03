import { Router } from 'express';
import { fruits } from '../mockData/index.js';
const router = Router();
router.get('/fruits', (req, res) => {
    res.status(200).json(fruits);
});
export default router;
//# sourceMappingURL=lookups.js.map
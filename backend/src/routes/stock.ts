import { Elysia } from 'elysia';
import { StockMovement } from '../models/StockMovement';
import { Part } from '../models/Part';
import { authenticateUser } from '../middleware/auth';

export const stockRoutes = (app: Elysia) =>
  app
    .group('/stock', (app) =>
      app
        .use(authenticateUser)
        .post('/movement', async ({ body, user }) => {
          const { partId, type, quantity, refNo, notes } = body as {
            partId: string;
            type: 'IN' | 'OUT';
            quantity: number;
            refNo: string;
            notes?: string;
          };

          // Find the part
          const part = await Part.findById(partId);
          if (!part) {
            return {
              success: false,
              message: 'Part not found'
            };
          }

          // Check if OUT movement has sufficient stock
          if (type === 'OUT' && part.qtyAvailable < quantity) {
            return {
              success: false,
              message: 'Insufficient stock available'
            };
          }

          // Create stock movement
          const stockMovement = new StockMovement({
            partId,
            type,
            quantity,
            refNo,
            notes,
            createdBy: user.id
          });

          await stockMovement.save();

          // Update part quantity
          const updateQuery = type === 'IN' 
            ? { $inc: { qtyAvailable: quantity } }
            : { $inc: { qtyAvailable: -quantity } };

          await Part.findByIdAndUpdate(partId, updateQuery);

          return {
            success: true,
            data: stockMovement
          };
        })

        .get('/movements', async ({ query }) => {
          const { partId, type, limit = 50 } = query as {
            partId?: string;
            type?: 'IN' | 'OUT';
            limit?: number;
          };

          const filter: any = {};
          if (partId) filter.partId = partId;
          if (type) filter.type = type;

          const movements = await StockMovement.find(filter)
            .populate('partId', 'sku name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

          return {
            success: true,
            data: movements
          };
        })

        .get('/low-stock', async () => {
          const lowStockParts = await Part.find({
            $expr: { $lte: ['$qtyAvailable', '$minStockLevel'] }
          }).sort({ name: 1 });

          return {
            success: true,
            data: lowStockParts
          };
        })
    );

import { Elysia } from 'elysia';
import { Part } from '../models/Part';
import { StockMovement } from '../models/StockMovement';
import { authenticateUser } from '../middleware/auth';

export const partRoutes = (app: Elysia) =>
  app
    .group('/parts', (app) =>
      app
        .use(authenticateUser)
        .get('/', async () => {
          const parts = await Part.find().sort({ name: 1 });
          return {
            success: true,
            data: parts
          };
        })

        .get('/:id', async ({ params }) => {
          const part = await Part.findById(params.id);
          if (!part) {
            return {
              success: false,
              message: 'Part not found'
            };
          }
          return {
            success: true,
            data: part
          };
        })

        .post('/', async ({ body, user }) => {
          const partData = body as {
            sku: string;
            name: string;
            description?: string;
            unitPrice: number;
            qtyAvailable: number;
            minStockLevel: number;
            category?: string;
            brand?: string;
          };

          const part = new Part(partData);
          await part.save();

          // Create initial stock movement if quantity > 0
          if (partData.qtyAvailable > 0) {
            const stockMovement = new StockMovement({
              partId: part._id,
              type: 'IN',
              quantity: partData.qtyAvailable,
              refNo: 'INITIAL-STOCK',
              notes: 'Initial stock entry',
              createdBy: user.id
            });
            await stockMovement.save();
          }

          return {
            success: true,
            data: part
          };
        })

        .put('/:id', async ({ params, body }) => {
          const partData = body as {
            sku?: string;
            name?: string;
            description?: string;
            unitPrice?: number;
            minStockLevel?: number;
            category?: string;
            brand?: string;
          };

          const part = await Part.findByIdAndUpdate(
            params.id,
            partData,
            { new: true, runValidators: true }
          );

          if (!part) {
            return {
              success: false,
              message: 'Part not found'
            };
          }

          return {
            success: true,
            data: part
          };
        })

        .delete('/:id', async ({ params }) => {
          const part = await Part.findByIdAndDelete(params.id);
          if (!part) {
            return {
              success: false,
              message: 'Part not found'
            };
          }

          return {
            success: true,
            message: 'Part deleted successfully'
          };
        })

        .get('/:id/stock-history', async ({ params }) => {
          const stockHistory = await StockMovement.find({ partId: params.id })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

          return {
            success: true,
            data: stockHistory
          };
        })

        .get('/low-stock/alert', async () => {
          const lowStockParts = await Part.find({
            $expr: { $lte: ['$qtyAvailable', '$minStockLevel'] }
          }).sort({ name: 1 });

          return {
            success: true,
            data: lowStockParts
          };
        })
    );

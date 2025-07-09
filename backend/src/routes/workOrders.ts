import { Elysia } from 'elysia';
import mongoose from 'mongoose';
import { WorkOrder } from '../models/WorkOrder';
import { WorkOrderPart } from '../models/WorkOrderPart';
import { Part } from '../models/Part';
import { StockMovement } from '../models/StockMovement';
import { authenticateUser } from '../middleware/auth';

export const workOrderRoutes = (app: Elysia) =>
  app
    .group('/work-orders', (app) =>
      app
        .use(authenticateUser)
        .get('/', async ({ query }) => {
          const { status, limit = 50 } = query as {
            status?: string;
            limit?: number;
          };

          const filter: any = {};
          if (status) filter.status = status;

          const workOrders = await WorkOrder.find(filter)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

          return {
            success: true,
            data: workOrders
          };
        })

        .get('/:id', async ({ params }) => {
          const workOrder = await WorkOrder.findById(params.id)
            .populate('createdBy', 'name');

          if (!workOrder) {
            return {
              success: false,
              message: 'Work order not found'
            };
          }

          // Get parts for this work order
          const workOrderParts = await WorkOrderPart.find({ workOrderId: params.id })
            .populate('partId', 'sku name');

          return {
            success: true,
            data: {
              ...workOrder.toObject(),
              parts: workOrderParts
            }
          };
        })

        .post('/', async ({ body, user }) => {
          const workOrderData = body as {
            customer: {
              name: string;
              phone?: string;
              email?: string;
            };
            vehicleInfo: {
              make: string;
              model: string;
              year: number;
              plateNumber?: string;
              mileage?: number;
            };
            laborCost: number;
            notes?: string;
            parts: Array<{
              partId: string;
              quantity: number;
            }>;
          };

          const session = await mongoose.startSession();
          session.startTransaction();

          try {
            // Generate work order number
            const count = await WorkOrder.countDocuments();
            const workOrderNo = `WO-${String(count + 1).padStart(6, '0')}`;

            // Create work order
            const workOrder = new WorkOrder({
              workOrderNo,
              customer: workOrderData.customer,
              vehicleInfo: workOrderData.vehicleInfo,
              laborCost: workOrderData.laborCost,
              notes: workOrderData.notes,
              createdBy: user.id
            });

            await workOrder.save({ session });

            // Process parts
            for (const partData of workOrderData.parts) {
              const part = await Part.findById(partData.partId).session(session);
              
              if (!part) {
                throw new Error(`Part not found: ${partData.partId}`);
              }

              if (part.qtyAvailable < partData.quantity) {
                throw new Error(`Insufficient stock for part: ${part.name}`);
              }

              // Create work order part
              const workOrderPart = new WorkOrderPart({
                workOrderId: workOrder._id,
                partId: partData.partId,
                quantity: partData.quantity,
                unitPriceSnapshot: part.unitPrice
              });

              await workOrderPart.save({ session });

              // Update part quantity
              await Part.findByIdAndUpdate(
                partData.partId,
                { $inc: { qtyAvailable: -partData.quantity } },
                { session }
              );

              // Create stock movement
              const stockMovement = new StockMovement({
                partId: partData.partId,
                type: 'OUT',
                quantity: partData.quantity,
                refNo: workOrderNo,
                notes: `Used in work order ${workOrderNo}`,
                createdBy: user.id
              });

              await stockMovement.save({ session });
            }

            await session.commitTransaction();

            return {
              success: true,
              data: workOrder
            };
          } catch (error) {
            await session.abortTransaction();
            return {
              success: false,
              message: error instanceof Error ? error.message : 'Failed to create work order'
            };
          } finally {
            session.endSession();
          }
        })

        .put('/:id', async ({ params, body }) => {
          const updateData = body as {
            status?: string;
            notes?: string;
            laborCost?: number;
          };

          const workOrder = await WorkOrder.findByIdAndUpdate(
            params.id,
            updateData,
            { new: true, runValidators: true }
          );

          if (!workOrder) {
            return {
              success: false,
              message: 'Work order not found'
            };
          }

          return {
            success: true,
            data: workOrder
          };
        })

        .delete('/:id', async ({ params, user }) => {
          const session = await mongoose.startSession();
          session.startTransaction();

          try {
            const workOrder = await WorkOrder.findById(params.id).session(session);
            if (!workOrder) {
              throw new Error('Work order not found');
            }

            // Only allow deletion if work order is not completed
            if (workOrder.status === 'completed') {
              throw new Error('Cannot delete completed work order');
            }

            // Get work order parts to restore stock
            const workOrderParts = await WorkOrderPart.find({ workOrderId: params.id }).session(session);

            // Restore stock for each part
            for (const woPart of workOrderParts) {
              await Part.findByIdAndUpdate(
                woPart.partId,
                { $inc: { qtyAvailable: woPart.quantity } },
                { session }
              );

              // Create stock movement for restoration
              const stockMovement = new StockMovement({
                partId: woPart.partId,
                type: 'IN',
                quantity: woPart.quantity,
                refNo: `${workOrder.workOrderNo}-CANCEL`,
                notes: `Stock restored from cancelled work order ${workOrder.workOrderNo}`,
                createdBy: user.id
              });

              await stockMovement.save({ session });
            }

            // Delete work order parts
            await WorkOrderPart.deleteMany({ workOrderId: params.id }, { session });

            // Delete work order
            await WorkOrder.findByIdAndDelete(params.id, { session });

            await session.commitTransaction();

            return {
              success: true,
              message: 'Work order deleted successfully'
            };
          } catch (error) {
            await session.abortTransaction();
            return {
              success: false,
              message: error instanceof Error ? error.message : 'Failed to delete work order'
            };
          } finally {
            session.endSession();
          }
        })
    );

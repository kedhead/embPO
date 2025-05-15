from flask import jsonify, request
from extensions import app, db, logger
from models import PurchaseOrder
from datetime import datetime
import uuid

@app.route('/api/purchase-orders', methods=['GET'])
def get_purchase_orders():
    orders = PurchaseOrder.query.all()
    return jsonify([order.to_dict() for order in orders])

@app.route('/api/purchase-orders/<string:order_id>', methods=['GET'])
def get_purchase_order(order_id):
    order = PurchaseOrder.query.get_or_404(order_id)
    return jsonify(order.to_dict())

@app.route('/api/purchase-orders', methods=['POST'])
def create_purchase_order():
    try:
        data = request.get_json()
        logger.debug(f"Received purchase order data: {data}")
        
        if not data:
            logger.error("No JSON data received in request")
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        required_fields = ['customer', 'lineItems', 'subtotal', 'taxRate', 'taxAmount', 'total']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logger.error(f"Missing required fields in request: {missing_fields}")
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Generate unique order number
        order_count = PurchaseOrder.query.count()
        order_number = f"PO-{datetime.now().strftime('%Y%m%d')}-{order_count + 1:04d}"

        new_order = PurchaseOrder(
            id=str(uuid.uuid4()),
            order_number=order_number,
            customer=data['customer'],
            line_items=data['lineItems'],
            subtotal=float(data['subtotal']),
            tax_rate=float(data['taxRate']),            tax_amount=float(data['taxAmount']),
            total=float(data['total']),
            notes=data.get('notes'),
            status='unpaid'
        )

        db.session.add(new_order)
        db.session.commit()
        
        return jsonify(new_order.to_dict()), 201

    except ValueError as ve:
        logger.error(f"Value error: {str(ve)}")
        return jsonify({"error": "Invalid numeric value provided"}), 400
    except Exception as e:
        logger.error(f"Error creating purchase order: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/purchase-orders/<string:order_id>', methods=['PUT'])
def update_purchase_order(order_id):
    try:
        order = PurchaseOrder.query.get_or_404(order_id)
        data = request.get_json()
        logger.debug(f"Received update data for order {order_id}: {data}")

        if not data:
            logger.error("No JSON data received in request")
            return jsonify({"error": "No data provided"}), 400

        # Update customer information
        if 'customer' in data:
            order.customer = data['customer']

        # Update line items and recalculate totals
        if 'lineItems' in data:
            order.line_items = data['lineItems']
            order.subtotal = float(data['subtotal'])
            order.tax_amount = float(data['taxAmount'])
            order.total = float(data['total'])

        # Update other fields
        if 'taxRate' in data:
            order.tax_rate = float(data['taxRate'])
        if 'notes' in data:
            order.notes = data['notes']
        if 'status' in data:
            order.status = data['status']

        # Update modified timestamp
        order.updated_at = datetime.utcnow()

        db.session.commit()
        logger.info(f"Successfully updated purchase order {order_id}")
        return jsonify(order.to_dict())

    except Exception as e:
        logger.error(f"Error updating purchase order {order_id}: {str(e)}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/purchase-orders/<string:order_id>', methods=['DELETE'])
def delete_purchase_order(order_id):
    try:
        order = PurchaseOrder.query.get_or_404(order_id)
        if not order:
            return jsonify({"error": f"Purchase order with ID {order_id} not found"}), 404
        
        logger.info(f"Attempting to delete purchase order {order_id}")
        db.session.delete(order)
        db.session.commit()
        logger.info(f"Successfully deleted purchase order {order_id}")
        return '', 204
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error deleting purchase order {order_id}: {error_msg}")
        db.session.rollback()
        return jsonify({"error": f"Failed to delete purchase order: {error_msg}"}), 500

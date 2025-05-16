from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime

# Import db and logger from extensions, delay importing mail to avoid circular imports
from extensions import db, logger
from models import PurchaseOrder # Import models

bp = Blueprint('api', __name__)

@bp.route('/purchase-orders', methods=['POST'])
def create_purchase_order():
    try:
        # Debug log the request
        data = request.get_json()
        if not data:
            logger.error("No JSON data received in request")
            return jsonify({"error": "No data provided"}), 400
        
        logger.debug(f"Received purchase order data: {data}")

        required_fields = ['customer', 'lineItems', 'subtotal', 'taxRate', 'taxAmount', 'total']
        for field in required_fields:
            if field not in data:
                logger.error(f"Missing required field: {field}")
                return jsonify({"error": f"Missing required field: {field}"}), 400

        order_id = str(uuid.uuid4())
        # Use the provided orderNumber if available, otherwise generate one
        order_number = data.get('orderNumber', f"PO-{datetime.now().strftime('%Y%m%d%H%M%S')}")
        
        due_date_str = data.get('dueDate')
        due_date_obj = None
        logger.debug(f"Due date string: {due_date_str}")
        if due_date_str:
            try:
                # First try ISO format with Z
                due_date_obj = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                logger.debug(f"Parsed due date: {due_date_obj}")
            except ValueError as e:
                try:
                    # Try YYYY-MM-DD format
                    due_date_obj = datetime.strptime(due_date_str, '%Y-%m-%d')
                    logger.debug(f"Parsed due date with YYYY-MM-DD format: {due_date_obj}")
                except ValueError as e2:
                    logger.error(f"Error parsing due date: {e2}")
                    return jsonify({"error": "Invalid dueDate format. Use ISO format or YYYY-MM-DD."}), 400

        logger.debug("Creating new order object")
        try:
            new_order = PurchaseOrder(
                id=order_id,
                order_number=order_number,
                customer=data['customer'],
                line_items=data['lineItems'],
                subtotal=float(data['subtotal']),
                tax_rate=float(data['taxRate']),
                tax_amount=float(data['taxAmount']),
                total=float(data['total']),
                notes=data.get('notes', ''),
                status=data.get('status', 'unpaid')
            )
            logger.debug("Order object created successfully")
        except Exception as e:
            logger.error(f"Error creating PurchaseOrder object: {str(e)}", exc_info=True)
            return jsonify({"error": f"Error creating purchase order object: {str(e)}"}), 400
        
        # Set the due_date separately if provided
        if due_date_obj:
            logger.debug(f"Setting due_date to {due_date_obj}")
            new_order.due_date = due_date_obj
        
        logger.debug("Adding order to database session")
        db.session.add(new_order)
        
        logger.debug("Committing to database")
        db.session.commit()
        logger.info(f"Purchase order created successfully: {order_id}")

        return jsonify(new_order.to_dict()), 201

    except ValueError as ve:
        logger.error(f"ValueError creating purchase order: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating purchase order: {e}", exc_info=True)
        return jsonify({"error": f"An unknown error occurred: {str(e)}"}), 500

@bp.route('/purchase-orders', methods=['GET'])
def get_purchase_orders():
    orders = PurchaseOrder.query.all()
    return jsonify([order.to_dict() for order in orders])

@bp.route('/purchase-orders/<string:order_id>', methods=['GET'])
def get_purchase_order(order_id):
    order = PurchaseOrder.query.get_or_404(order_id)
    return jsonify(order.to_dict())

@bp.route('/purchase-orders/<string:order_id>', methods=['PUT'])
def update_purchase_order(order_id):
    try:
        data = request.get_json()
        logger.debug(f"Received update data for order {order_id}: {data}")
        
        if not data:
            logger.error("No JSON data received in request")
            return jsonify({"error": "No data provided"}), 400

        order = PurchaseOrder.query.get_or_404(order_id)
        if not order:
            logger.error(f"Purchase order not found with ID {order_id}")
            return jsonify({"error": f"Purchase order with ID {order_id} not found"}), 404
        
        # Update fields
        if 'customer' in data:
            order.customer = data['customer']
        if 'lineItems' in data:
            order.line_items = data['lineItems']
        if 'subtotal' in data:
            order.subtotal = data['subtotal']
        if 'taxRate' in data:
            order.tax_rate = data['taxRate']
        if 'taxAmount' in data:
            order.tax_amount = data['taxAmount']
        if 'total' in data:
            order.total = data['total']
        if 'status' in data:
            logger.debug(f"Updating status from {order.status} to {data['status']}")
            order.status = data['status']
        if 'notes' in data:
            order.notes = data['notes']
        if 'dueDate' in data and data['dueDate']:
            try:
                # First try ISO format
                due_date_obj = datetime.fromisoformat(data['dueDate'].replace('Z', '+00:00'))
                order.due_date = due_date_obj
                logger.debug(f"Updated due_date to {due_date_obj} from ISO format")
            except ValueError:
                try:
                    # Then try YYYY-MM-DD format
                    order.due_date = datetime.strptime(data['dueDate'], '%Y-%m-%d')
                    logger.debug(f"Updated due_date using YYYY-MM-DD format")
                except ValueError as e:
                    logger.error(f"Error parsing due date: {e}")
                    return jsonify({"error": "Invalid dueDate format"}), 400
        
        db.session.commit()
        logger.info(f"Successfully updated purchase order {order_id}")
        return jsonify(order.to_dict())

    except Exception as e:
        logger.error(f"Error updating purchase order {order_id}: {str(e)}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/purchase-orders/<string:order_id>', methods=['DELETE'])
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
        return jsonify({"error": error_msg}), 500

@bp.route('/test', methods=['GET'])
def test_endpoint():
    logger.info("Test endpoint accessed")
    return jsonify({"message": "Backend is working correctly", "status": "ok"}), 200

@bp.route('/health', methods=['GET'])
def api_health_check():
    """A simple endpoint to verify that the API is working"""
    logger.info("API Health check endpoint called")
    return jsonify({
        "status": "ok",
        "message": "API is operational"
    }), 200

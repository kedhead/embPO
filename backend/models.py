from extensions import db
from datetime import datetime
from sqlalchemy.types import TypeDecorator, VARCHAR
import json

class JSONType(TypeDecorator):
    impl = VARCHAR

    def process_bind_param(self, value, dialect):
        if value is not None:
            try:
                return json.dumps(value)
            except (TypeError, ValueError) as e:
                # Log the error and the value for debugging
                print(f"Error serializing JSON: {str(e)}, Value: {value}")
                raise ValueError(f"Cannot serialize to JSON: {str(e)}")
        return None

    def process_result_value(self, value, dialect):
        if value is not None:
            try:
                return json.loads(value)
            except json.JSONDecodeError as e:
                print(f"Error deserializing JSON: {str(e)}, Value: {value}")
                return {}  # Return empty dict on error instead of failing
        return None

class PurchaseOrder(db.Model):
    __tablename__ = 'purchase_orders'
    
    id = db.Column(db.String(36), primary_key=True)
    order_number = db.Column(db.String(100), unique=True, nullable=False)
    customer = db.Column(JSONType, nullable=False)
    line_items = db.Column(JSONType, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    tax_rate = db.Column(db.Float, nullable=False)
    tax_amount = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default='unpaid')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'orderNumber': self.order_number,
            'customer': self.customer,
            'lineItems': self.line_items,
            'subtotal': self.subtotal,
            'taxRate': self.tax_rate,
            'taxAmount': self.tax_amount,
            'total': self.total,
            'notes': self.notes,
            'status': self.status,
            'createdAt': self.created_at.isoformat(),
            'dueDate': self.due_date.isoformat() if self.due_date else None
        }

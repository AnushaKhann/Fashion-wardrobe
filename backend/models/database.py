from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class ClothingItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    color = db.Column(db.String(50), nullable=True)

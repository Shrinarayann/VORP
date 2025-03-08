from flask import Flask
from app.routes.vrp_routes import vrp_bp

def create_app():
    app=Flask(__name__)
    app.register_blueprint(vrp_bp)
    return app
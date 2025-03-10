from flask import Blueprint, request, jsonify
from supabase import create_client
from dotenv import load_dotenv
import os
load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
auth_bp = Blueprint("auth", __name__,url_prefix='/api/v1') 



@auth_bp.route("/auth", methods=["POST"])
def signin():
    pass


print(supabase.table('profiles').select("id").limit(1).execute())


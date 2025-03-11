from flask import Blueprint, request, jsonify
from supabase import create_client

supabase = create_client("https://laqmmoixletufgzhgwkl.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcW1tb2l4bGV0dWZnemhnd2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MTI5NDMsImV4cCI6MjA1NzE4ODk0M30.iqwf5Z6Gmga9BUlv3br4nxG6RvqFvYRPoHcIAaYbodc")
auth_bp = Blueprint("auth", __name__,url_prefix='/api/v1') 



@auth_bp.route("/auth", methods=["POST"])
def signin():
    pass


print(supabase.table('profiles').select("id").limit(1).execute())


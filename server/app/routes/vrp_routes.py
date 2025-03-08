from flask import Blueprint, request, jsonify
from ..controllers import vrp_solution

vrp_bp = Blueprint("vrp", __name__,url_prefix='/api/v1') 

@vrp_bp.route("/calculate_routes", methods=["POST"])
def solve_vrp():
    data = request.get_json()
    solution = vrp_solution.calculate_routes(data,request)
    print('\n\n Solution recieved in routes')
    print(solution)
    return jsonify(solution)


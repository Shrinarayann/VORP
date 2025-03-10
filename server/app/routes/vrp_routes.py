from flask import Blueprint, request, jsonify
from ..controllers import vrp_solution

vrp_bp = Blueprint("vrp", __name__,url_prefix='/api/v1') 

@vrp_bp.route("/calculate_routes", methods=["POST"])
def solve_vrp():
    if 'file' in request.files:
        excel_file=request.files['file']
        return vrp_solution.excel_route_solver(excel_file)
    
    data = request.get_json()

    required_fields = ["locations", "num_vehicles", "depot", "capacities", "demands"]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
        
    solution = vrp_solution.calculate_routes(data)
    print('\n\n Solution recieved in routes')
    print(solution)
    return jsonify(solution)


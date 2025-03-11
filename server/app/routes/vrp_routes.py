from flask import Blueprint, request, jsonify
from ..controllers import vrp_solution

vrp_bp = Blueprint("vrp", __name__,url_prefix='/api/v1') 


@vrp_bp.route("/calculate_routes", methods=["POST"])
def solve_vrp():

    required_fields = ["num_vehicles", "depot", "capacities", "demands"]
    if 'file' in request.files:
        excel_file=request.files['file']
    else:
        excel_file=None
        required_fields.append('locations')
    
    data=request.json()
    
    data = request.get_json()

    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400


    solution = vrp_solution.calculate_routes(data,excel_file)
    print('\n\n Solution recieved in routes')
    print(solution)
    return jsonify(solution)



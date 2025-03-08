
from flask import jsonify
from ..utils import distance_matrix,vrp_solver

def calculate_routes(data,request):
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.json
    required_fields = ["locations", "num_vehicles", "depot", "capacities", "demands"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:
        locations = data["locations"]
        num_vehicles = data["num_vehicles"]
        depot = data["depot"]
        vehicle_capacities = data["capacities"]
        demands = data["demands"]

        # Convert locations to a list of lists
        osrm_coords = [[lon, lat] for lon, lat in locations]

        print(type(osrm_coords))

        dist_matrix=distance_matrix.distance_matrix_calc(osrm_coords)
        print()
        print(dist_matrix)
        data = {
        "distance_matrix": dist_matrix,
        "demands": demands,
        "vehicle_capacities": vehicle_capacities,
        "num_vehicles": num_vehicles,
        "depot": depot
    }
        res=vrp_solver.solve_cvrp(data)
        print(res)
        # OR-Tools response
    # response = {
    #     'status': 'success',
    #     'objective_value': 5,
    #     'routes': [
    #         {'vehicle_id': 0, 'route': [{'node': 0, 'load': 0}, {'node': 1, 'load': 50}, {'node': 0, 'load': 50}], 'distance': 2, 'load': 50},
    #         {'vehicle_id': 1, 'route': [{'node': 0, 'load': 0}, {'node': 2, 'load': 75}, {'node': 3, 'load': 175}, {'node': 0, 'load': 175}], 'distance': 3, 'load': 175}
    #     ],
    #     'total_distance': 5,
    #     'total_load': 225
    # }

    # Transform response into desired format
        formatted_routes = {
            int(route['vehicle_id']): [step['node'] for step in route['route']]
            for route in res['routes']
        }

        for i in formatted_routes:
            formatted_routes[i]=[locations[j] for j in formatted_routes[i]]
        # Output the result
        print('\n\nFinal Calculated routes')
        print(formatted_routes)

            # Return a valid response
        return {"message": "Success", "calculated_routes": formatted_routes}

    except Exception as e:
        return {"error": str(e)}
    

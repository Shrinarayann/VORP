from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import requests
import distance_matrix

app = Flask(__name__)
port=8080
CORS(app)  # Enable CORS for all routes
# OSRM_URL=

def solve_cvrp(data):
    print("Data received for solving CVRP:", data)
    
    # Create the routing index manager
    manager = pywrapcp.RoutingIndexManager(
        len(data["distance_matrix"]), data["num_vehicles"], data["depot"]
    )
    # Create Routing Model
    routing = pywrapcp.RoutingModel(manager)

    # Create and register a transit callback
    def distance_callback(from_index, to_index):
        # Convert from routing variable Index to distance matrix NodeIndex
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data["distance_matrix"][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Add Capacity constraint
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return data["demands"][from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        data["vehicle_capacities"],  # vehicle maximum capacities
        True,  # start cumul to zero
        "Capacity",
    )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.FromSeconds(data.get("time_limit", 1))

    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        return {"status": "No solution found"}
    
    result = {"status": "success", "objective_value": solution.ObjectiveValue(), "routes": []}
    total_distance = 0
    total_load = 0
    
    for vehicle_id in range(data["num_vehicles"]):
        if not routing.IsVehicleUsed(solution, vehicle_id):
            continue
            
        route_info = {
            "vehicle_id": vehicle_id,
            "route": [],
            "distance": 0,
            "load": 0
        }
        
        index = routing.Start(vehicle_id)
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            route_info["load"] += data["demands"][node_index]
            route_info["route"].append({
                "node": node_index,
                "load": route_info["load"]
            })
            
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_info["distance"] += routing.GetArcCostForVehicle(
                previous_index, index, vehicle_id
            )
            
        # Add the depot return
        node_index = manager.IndexToNode(index)
        route_info["route"].append({
            "node": node_index,
            "load": route_info["load"]
        })
        
        total_distance += route_info["distance"]
        total_load += route_info["load"]
        result["routes"].append(route_info)
    
    result["total_distance"] = total_distance
    result["total_load"] = total_load

    return result

@app.route('/api/solve', methods=['POST'])
def solve():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.json
    required_fields = ["distance_matrix", "demands", "vehicle_capacities", "num_vehicles", "depot"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:
        result = solve_cvrp(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/example', methods=['GET'])
def example():
    data = {
        "distance_matrix": [
            [0, 548, 776, 696, 582, 274, 502, 194, 308, 194, 536, 502, 388, 354, 468, 776, 662],
            [548, 0, 684, 308, 194, 502, 730, 354, 696, 742, 1084, 594, 480, 674, 1016, 868, 1210],
            [776, 684, 0, 992, 878, 502, 274, 810, 468, 742, 400, 1278, 1164, 1130, 788, 1552, 754],
            [696, 308, 992, 0, 114, 650, 878, 502, 844, 890, 1232, 514, 628, 822, 1164, 560, 1358],
            [582, 194, 878, 114, 0, 536, 764, 388, 730, 776, 1118, 400, 514, 708, 1050, 674, 1244],
            [274, 502, 502, 650, 536, 0, 228, 308, 194, 240, 582, 776, 662, 628, 514, 1050, 708],
            [502, 730, 274, 878, 764, 228, 0, 536, 194, 468, 354, 1004, 890, 856, 514, 1278, 480],
            [194, 354, 810, 502, 388, 308, 536, 0, 342, 388, 730, 468, 354, 320, 662, 742, 856],
            [308, 696, 468, 844, 730, 194, 194, 342, 0, 274, 388, 810, 696, 662, 320, 1084, 514],
            [194, 742, 742, 890, 776, 240, 468, 388, 274, 0, 342, 536, 422, 388, 274, 810, 468],
            [536, 1084, 400, 1232, 1118, 582, 354, 730, 388, 342, 0, 878, 764, 730, 388, 1152, 354],
            [502, 594, 1278, 514, 400, 776, 1004, 468, 810, 536, 878, 0, 114, 308, 650, 274, 844],
            [388, 480, 1164, 628, 514, 662, 890, 354, 696, 422, 764, 114, 0, 194, 536, 388, 730],
            [354, 674, 1130, 822, 708, 628, 856, 320, 662, 388, 730, 308, 194, 0, 342, 422, 536],
            [468, 1016, 788, 1164, 1050, 514, 514, 662, 320, 274, 388, 650, 536, 342, 0, 764, 194],
            [776, 868, 1552, 560, 674, 1050, 1278, 742, 1084, 810, 1152, 274, 388, 422, 764, 0, 798],
            [662, 1210, 754, 1358, 1244, 708, 480, 856, 514, 468, 354, 844, 730, 536, 194, 798, 0],
        ],
        "demands": [0, 1, 1, 2, 4, 2, 4, 8, 8, 1, 2, 1, 2, 4, 4, 8, 8],
        "vehicle_capacities": [15, 15, 15, 15],
        "num_vehicles": 4,
        "depot": 0
    }
    
    result = solve_cvrp(data)
    return jsonify(result)

@app.route('/api/v1/calculate_routes/', methods=['POST'])
def calculate_routes():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.json
    required_fields = ["locations", "num_vehicles", "depot", "capacities", "demands"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:
        locations = data["locations"]
        num_vehicles = int(data["num_vehicles"])
        depot = int(data["depot"])
        vehicle_capacities = [int(cap) for cap in data["capacities"]]
        demands = [int(demand) for demand in data["demands"]]

        # Validate inputs
        if len(locations) != len(demands):
            return jsonify({"error": "Number of locations must match number of demands"}), 400
        
        if num_vehicles <= 0 or num_vehicles > len(vehicle_capacities):
            return jsonify({"error": "Invalid number of vehicles"}), 400
            
        if depot < 0 or depot >= len(locations):
            return jsonify({"error": "Invalid depot index"}), 400

        # Print debugging information
        print(f"Locations: {locations}")
        print(f"Num vehicles: {num_vehicles}")
        print(f"Vehicle capacities: {vehicle_capacities}")
        print(f"Demands: {demands}")
        print(f"Depot: {depot}")

        # Convert locations to format expected by distance_matrix_calc
        osrm_coords = [[float(lon), float(lat)] for lon, lat in locations]
        
        # Calculate distance matrix
        dist_matrix = distance_matrix.distance_matrix_calc(osrm_coords)
        
        # Ensure the distance matrix has correct dimensions
        if len(dist_matrix) != len(locations):
            return jsonify({"error": "Distance matrix calculation failed"}), 500
            
        # Convert distance matrix to integer values in meters (OR-Tools works better with integers)
        # Multiply by 1000 to convert km to m, then round to nearest integer
        int_dist_matrix = []
        for row in dist_matrix:
            int_row = [int(distance * 1000) for distance in row]
            int_dist_matrix.append(int_row)
            
        # Check that demands don't exceed capacity (just for validation)
        total_demand = sum(demands) - demands[depot]  # Exclude depot demand
        total_capacity = sum(vehicle_capacities)
        if total_demand > total_capacity:
            return jsonify({"error": f"Total demand ({total_demand}) exceeds total capacity ({total_capacity})"}), 400

        # Prepare data for OR-Tools solver
        solver_data = {
            "distance_matrix": int_dist_matrix,  # Use integer distances in meters
            "demands": demands,
            "vehicle_capacities": vehicle_capacities,
            "num_vehicles": num_vehicles,
            "depot": depot,
            "time_limit": 5  # Give it more time to solve
        }
        
        print("Solver data:", solver_data)
        res = solve_cvrp(solver_data)
        
        if res.get("status") == "No solution found":
            return jsonify({"error": "No feasible solution found. Check demands and capacities."}), 400
            
        # Transform response into desired format
        formatted_routes = {}
        for route in res['routes']:
            route_id = int(route['vehicle_id'])
            node_indices = [step['node'] for step in route['route']]
            formatted_routes[route_id] = [locations[idx] for idx in node_indices]
        
        return jsonify({
            "message": "Success", 
            "calculated_routes": formatted_routes,
            "metrics": {
                "total_distance": res['total_distance'],
                "total_load": res['total_load']
            }
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

    

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=port)

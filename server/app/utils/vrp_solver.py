
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def solve_cvrp(data):
    # ... (existing code unchanged)
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

import { Button } from "./components/ui/button"
import { Progress } from "./components/ui/progress"


const App = () => {
  return (
    <div className="p-5 space-y-2 bg-gray-100">
      return <Button variant="destructive">Destructive</Button>
      <Progress value={33} />
    </div>
  )
}

export default App
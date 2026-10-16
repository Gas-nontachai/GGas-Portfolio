import PerspectiveRoad from './PerspectiveRoad'
import RoadsideEnvironment from './RoadsideEnvironment'
import Roadblock from './Roadblock'
import CarDashboard from './CarDashboard'

export default function DrivingScene() {
  return (
    <div className="ending-world" aria-hidden="true">
      <div className="ending-ground" />
      <RoadsideEnvironment />
      <PerspectiveRoad />
      <Roadblock />
      <CarDashboard />
    </div>
  )
}

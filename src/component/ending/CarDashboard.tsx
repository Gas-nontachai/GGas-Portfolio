import dashboard from '../../assets/ending/dashboard.png'
import steering from '../../assets/ending/steering-wheel.png'

export default function CarDashboard() {
  return (
    <div className="ending-cockpit" data-ending-cockpit>
      <img src={dashboard} className="ending-dashboard" alt="" />
      <img src={steering} className="ending-steering" data-ending-steering alt="" />
    </div>
  )
}

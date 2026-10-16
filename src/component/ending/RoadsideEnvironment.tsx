import cloud from '../../assets/journey_timeline/cloud_large.png'
import smallCloud from '../../assets/journey_timeline/cloud_small.png'
import round from '../../assets/journey_timeline/tree_round.png'
import tall from '../../assets/journey_timeline/tree_tall.png'
import bush from '../../assets/journey_timeline/bush.png'
import lamp from '../../assets/journey_timeline/street_lamp.png'
import { roadsideObjects } from './ending.config'

const images: Record<string, string> = { round, tall, bush, lamp }

export default function RoadsideEnvironment() {
  return (
    <>
      <div className="ending-clouds" data-ending-clouds>
        <img src={cloud} className="ending-cloud ending-cloud--one" alt="" />
        <img src={smallCloud} className="ending-cloud ending-cloud--two" alt="" />
        <img src={cloud} className="ending-cloud ending-cloud--three" alt="" />
      </div>
      <svg
        className="ending-hills"
        viewBox="0 0 1600 280"
        preserveAspectRatio="none"
        data-ending-hills
      >
        <path
          fill="var(--ending-hill-far)"
          d="M-100 280V190Q120 -100 430 185Q690 -70 980 160Q1270 -100 1700 180V280Z"
        />
        <path
          fill="var(--ending-hill-near)"
          d="M-100 280V245Q170 50 500 220Q950 25 1200 220Q1500 70 1700 230V280Z"
        />
      </svg>
      {roadsideObjects.map((object, index) => (
        <div
          className={`ending-roadside ending-roadside--${object.kind}`}
          key={index}
          data-roadside
        >
          <img src={images[object.kind]} alt="" />
        </div>
      ))}
    </>
  )
}

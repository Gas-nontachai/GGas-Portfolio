import type { Dispatch } from 'react'
import avatar from '../../assets/current-experiments-asset-pack/avatar.png'
import shelf from '../../assets/current-experiments-asset-pack/stair.png'
import desk from '../../assets/current-experiments-asset-pack/desk.png'
import chair from '../../assets/current-experiments-asset-pack/chair.png'
import books from '../../assets/current-experiments-asset-pack/book.png'
import lamp from '../../assets/current-experiments-asset-pack/light.png'
import camera from '../../assets/current-experiments-asset-pack/cam.png'
import { experiments } from './experiments.config'
import ExperimentObject from './ExperimentObject'
import { getPreviewExperiment } from './experimentSelection'
import type { ExperimentSelection, SelectionAction } from './experimentSelection'

export default function ExperimentScene({
  selection,
  dispatch,
}: {
  selection: ExperimentSelection
  dispatch: Dispatch<SelectionAction>
}) {
  return (
    <div className="experiments-stage">
      <div className="experiments-scene-art">
        <div className="experiments-scenery" aria-hidden="true">
          <img className="experiments-shelf" src={shelf} width="800" height="454" alt="" />
          <div className="experiments-note experiments-note--pink">
            Build.
            <br />
            Learn.
            <br />
            Create.
            <br />
            Repeat. <span>☺</span>
          </div>
          <div className="experiments-avatar" data-experiment-avatar>
            <img src={avatar} width="1000" height="929" alt="" />
          </div>
          <img
            className="experiments-desk"
            src={desk}
            width="1415"
            height="533"
            alt=""
            data-experiment-reveal
          />
          <img
            className="experiments-books"
            src={books}
            width="800"
            height="561"
            alt=""
            data-experiment-reveal
          />
          <img
            className="experiments-lamp"
            src={lamp}
            width="686"
            height="800"
            alt=""
            data-experiment-reveal
          />
          <img
            className="experiments-camera"
            src={camera}
            width="800"
            height="645"
            alt=""
            data-experiment-reveal
          />
          <div className="experiments-note experiments-note--yellow">
            Make
            <br />
            progress,
            <br />
            not perfect. ☺
          </div>
          <div className="experiments-note experiments-note--green">
            Same curiosity.
            <br />
            Different day. ☺
          </div>
        </div>
        <div className="experiments-foreground" aria-hidden="true">
          <img
            className="experiments-chair"
            src={chair}
            width="705"
            height="800"
            alt=""
            data-experiment-reveal
          />
        </div>
      </div>
      <div className="experiments-objects" role="group" aria-labelledby="experiments-choose">
        {experiments.map((experiment) => (
          <ExperimentObject
            key={experiment.id}
            experiment={experiment}
            selected={selection.selected === experiment.id}
            previewed={getPreviewExperiment(selection) === experiment.id}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  )
}

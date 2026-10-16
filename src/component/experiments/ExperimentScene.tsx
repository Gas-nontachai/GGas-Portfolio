import type { Dispatch } from 'react'
import { Smile } from 'lucide-react'
import avatar from '../../assets/experiments-neubrutal/avatar.webp'
import shelf from '../../assets/experiments-neubrutal/shelf.webp'
import desk from '../../assets/experiments-neubrutal/desk.webp'
import chair from '../../assets/experiments-neubrutal/chair.webp'
import books from '../../assets/experiments-neubrutal/books.webp'
import lamp from '../../assets/experiments-neubrutal/lamp.webp'
import camera from '../../assets/experiments-neubrutal/camera.webp'
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
          <img className="experiments-shelf" src={shelf} width="800" height="457" alt="" />
          <div className="experiments-note experiments-note--pink">
            Build.
            <br />
            Learn.
            <br />
            Create.
            <br />
            Repeat. <Smile className="experiments-note-smile" aria-hidden="true" />
          </div>
          <div className="experiments-avatar" data-experiment-avatar>
            <img src={avatar} width="800" height="742" alt="" />
          </div>
          <img
            className="experiments-desk"
            src={desk}
            width="1600"
            height="603"
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
            height="644"
            alt=""
            data-experiment-reveal
          />
          <div className="experiments-note experiments-note--yellow">
            Make
            <br />
            progress,
            <br />
            not perfect. <Smile className="experiments-note-smile" aria-hidden="true" />
          </div>
          <div className="experiments-note experiments-note--green">
            Same curiosity.
            <br />
            Different day. <Smile className="experiments-note-smile" aria-hidden="true" />
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

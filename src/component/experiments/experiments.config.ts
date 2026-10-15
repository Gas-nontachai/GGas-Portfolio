import flutter from '../../assets/current-experiments-asset-pack/flutter-dev.png'
import esp32 from '../../assets/current-experiments-asset-pack/esp32-iot.png'
import printing from '../../assets/current-experiments-asset-pack/3dprint.png'
import davinci from '../../assets/current-experiments-asset-pack/davinci.png'
import type { ExperimentId } from './experimentSelection'

export type Experiment = {
  id: ExperimentId
  title: string
  asset: string
  width: number
  height: number
  color: string
  status: 'learning' | 'exploring' | 'experimenting'
  translationKey: `experiments.items.${ExperimentId}`
  projectUrl?: string
}

export const experiments: readonly Experiment[] = [
  {
    id: 'flutter',
    title: 'Flutter',
    asset: flutter,
    width: 559,
    height: 800,
    color: '#78b7ff',
    status: 'learning',
    translationKey: 'experiments.items.flutter',
  },
  {
    id: 'esp32',
    title: 'ESP32 & IoT',
    asset: esp32,
    width: 800,
    height: 694,
    color: '#94dca0',
    status: 'exploring',
    translationKey: 'experiments.items.esp32',
  },
  {
    id: 'printing',
    title: '3D Printing',
    asset: printing,
    width: 800,
    height: 597,
    color: '#ffe16b',
    status: 'experimenting',
    translationKey: 'experiments.items.printing',
  },
  {
    id: 'davinci',
    title: 'DaVinci Resolve',
    asset: davinci,
    width: 800,
    height: 681,
    color: '#ff9cc9',
    status: 'learning',
    translationKey: 'experiments.items.davinci',
  },
]

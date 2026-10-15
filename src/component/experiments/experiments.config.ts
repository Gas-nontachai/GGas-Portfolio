import flutter from '../../assets/experiments-neubrutal/flutter.webp'
import esp32 from '../../assets/experiments-neubrutal/esp32.webp'
import printing from '../../assets/experiments-neubrutal/printing.webp'
import davinci from '../../assets/experiments-neubrutal/davinci.webp'
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
    color: '#68a4ff',
    status: 'learning',
    translationKey: 'experiments.items.flutter',
  },
  {
    id: 'esp32',
    title: 'ESP32 & IoT',
    asset: esp32,
    width: 800,
    height: 694,
    color: '#b9edbc',
    status: 'learning',
    translationKey: 'experiments.items.esp32',
  },
  {
    id: 'printing',
    title: '3D Printing',
    asset: printing,
    width: 800,
    height: 640,
    color: '#ffe16b',
    status: 'learning',
    translationKey: 'experiments.items.printing',
  },
  {
    id: 'davinci',
    title: 'DaVinci Resolve',
    asset: davinci,
    width: 800,
    height: 547,
    color: '#ff80ab',
    status: 'learning',
    translationKey: 'experiments.items.davinci',
  },
]

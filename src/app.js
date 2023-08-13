import * as THREE from 'three'
import { addPass, useCamera, useGui, useRenderSize, useScene, useTick } from './render/init.js'
// import postprocessing passes
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import TRACK from './sounds/TOTL.mp3'
import { gsap } from 'gsap'

class Visualizer {
  constructor(mesh, frequencyUniformName) {
    // mesh setup
    this.mesh = mesh
    this.frequencyUniformName = frequencyUniformName
    // whole song
    this.mesh.material.uniforms[this.frequencyUniformName] = { value: 0 }

    // STEMS
    this.mesh.material.uniforms['uLowPass'] = { value: 0 }

    //  audio listener
    this.listener = new THREE.AudioListener()
    this.mesh.add(this.listener)

    // global audio source
    this.sound = new THREE.Audio(this.listener)
    this.loader = new THREE.AudioLoader()

    // analyzer
    this.analyzer = new THREE.AudioAnalyser(this.sound, 128)
  }

  lowpass() {
    // 40-44 seems to be for the voice frequencies
    // 36-40 seems to be for the voice frequencies
    // 36-40 seems to be for the voice frequencies
    //

    let value = 0
    const data = this.analyzer.getFrequencyData()

    for (let i = 42; i < 46; i++) {
      value += data[i]
    }

    return value / data.length
  }

  load(path) {
    this.loader.load(path, (buffer) => {
      this.sound.setBuffer(buffer)
      this.sound.setLoop(true)
      this.sound.setVolume(0.45)
      this.sound.play()
    })
  }

  getFrequency() {
    return this.analyzer.getAverageFrequency()
  }

  update() {
    // whole song
    const freqAvg = Math.max(this.getFrequency() - 90, 0) / 2
    this.mesh.material.uniforms[this.frequencyUniformName].value = freqAvg

    const lowFreq = this.lowpass()
    // this.mesh.material.uniforms['uLowPass'].value = lowFreq
    const lowpassfreq = this.mesh.material.uniforms['uLowPass']

    gsap.to(lowpassfreq, {
      duration: 0.25,
      ease: 'Fast.easeOut',
      value: lowFreq,
    })
  }
}

const startApp = () => {
  const scene = useScene()
  const camera = useCamera()
  // const gui = useGui()
  const { width, height } = useRenderSize()

  // settings
  const MOTION_BLUR_AMOUNT = 0.125

  // lighting
  const dirLight = new THREE.DirectionalLight('#f26cff', 0.6)
  dirLight.position.set(2, 2, 2)
  const ambientLight = new THREE.AmbientLight('#4255ff', 0.5)
  scene.add(dirLight, ambientLight)

  // meshes
  const geometry = new THREE.IcosahedronGeometry(1, 200)
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    wireframe: true,
  })

  material.uniforms.uTime = { value: 0 }

  const ico = new THREE.Mesh(geometry, material)

  const visulaizer = new Visualizer(ico, 'uAvgAudioFrequency')
  visulaizer.load(TRACK)
  scene.add(ico)

  // GUI

  // postprocessing
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
  }

  // save pass
  const savePass = new SavePass(new THREE.WebGLRenderTarget(width, height, renderTargetParameters))

  // blend pass
  const blendPass = new ShaderPass(BlendShader, 'tDiffuse1')
  blendPass.uniforms['tDiffuse2'].value = savePass.renderTarget.texture
  blendPass.uniforms['mixRatio'].value = MOTION_BLUR_AMOUNT

  // output pass
  const outputPass = new ShaderPass(CopyShader)
  outputPass.renderToScreen = true

  //postprocessing

  addPass(new AfterimagePass(0.85))

  useTick(({ timestamp, timeDiff }) => {
    const time = timestamp / 5000
    material.uniforms.uTime.value = time
    visulaizer.update()
  })
}

export default startApp

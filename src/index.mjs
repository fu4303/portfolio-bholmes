import { watchSectionHeaders } from './_includes/table-of-contents-observer'

const animateColoredAccent = (sectionIndex, headers) => {
  const allStripes = document.querySelectorAll('#line-accents > *')
  // in the case that sectionIndex = -1 (no section on screen),
  // this will come back null
  const selectedStripe = document.querySelector(
    `#line-accents > :nth-child(${sectionIndex + 1})`
  )
  for (let stripe of allStripes) {
    if (stripe === selectedStripe) {
      stripe.classList.add('active')
    } else {
      stripe.classList.remove('active')
    }
  }
}

export const use11tyData = true

export default ({ data: { works } }) => {
  const unobserveHeaders = watchSectionHeaders(animateColoredAccent)

  function VideoEl(elementId) {
    this.el = document.getElementById(elementId)
    this.source = document.querySelector(`#${elementId} > source:first-of-type`)
    this.backupSource = document.querySelector(
      `#${elementId} > source:nth-of-type(2)`
    )
  }

  const manageProjects = () => {
    const firstVid = new VideoEl('projects-1')
    const secondVid = new VideoEl('projects-2')
    const titleEl = document.getElementById('projects-title')
    const bodyEl = document.getElementById('projects-body')
    const diceEl = document.getElementById('dice-container')

    let unusedIndices = []
    const resetUnusedIndices = () =>
      (unusedIndices = [...Array(works.length).keys()])
    resetUnusedIndices() // set unused indices to list of indices up to projects.length
    unusedIndices.shift() // remove index 0, since this is the initial index shown

    const newIndex = () => {
      if (unusedIndices.length === 0) resetUnusedIndices()

      const randIndex = Math.floor(Math.random() * unusedIndices.length)
      return unusedIndices.splice(randIndex, 1)
    }

    const setUpVideoEl = (video, index) => {
      video.source.src = works[index].videoSrc
      video.backupSource.src = works[index].backupVideoSrc
      video.el.poster = works[index].img.src
      video.el.load()
    }

    let index = newIndex()
    setUpVideoEl(secondVid, index)

    const setProjectInfo = (nextVid, currVid) => {
      // wait for dice to hit the computer
      setTimeout(() => {
        titleEl.innerText = works[index].title
        bodyEl.innerHTML = works[index].body

        index = newIndex()
        nextVid.el.classList.add('visible')
        currVid.el.classList.remove('visible')
        setUpVideoEl(currVid, index)
      }, 400)
    }

    const triggerDiceRoll = () => {
      diceEl.classList.remove('animated')
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          diceEl.classList.add('animated')
        })
      })
    }

    let showFirst = false
    return () => {
      triggerDiceRoll()
      const nextVid = showFirst ? firstVid : secondVid
      const currVid = showFirst ? secondVid : firstVid
      setProjectInfo(nextVid, currVid)
      showFirst = !showFirst
    }
  }

  const nextProject = manageProjects()

  const clickListener = (event) => {
    if (event.target.id === 'generate-random-project') {
      nextProject()
    }
  }
  document.addEventListener('click', clickListener)

  return () => {
    unobserveHeaders()
    document.removeEventListener('click', clickListener)
  }
}

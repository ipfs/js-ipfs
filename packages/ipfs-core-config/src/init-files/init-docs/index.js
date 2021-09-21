import about from './about.js'
import contact from './contact.js'
import help from './help.js'
import quickStart from './quick-start.js'
import readme from './readme.js'
import securityNotes from './security-notes.js'
import docsIndex from './docs/index.js'
import tourIntro from './tour/0.0-intro.js'
import { fromString } from 'uint8arrays/from-string'

export default [{
  content: fromString(about),
  path: '/init-docs/about'
}, {
  content: fromString(contact),
  path: '/init-docs/contact'
}, {
  content: fromString(help),
  path: '/init-docs/help'
}, {
  content: fromString(quickStart),
  path: '/init-docs/quick-start'
}, {
  content: fromString(readme),
  path: '/init-docs/readme'
}, {
  content: fromString(securityNotes),
  path: '/init-docs/security-notes'
}, {
  content: fromString(docsIndex),
  path: '/init-docs/docs/index'
}, {
  content: fromString(tourIntro),
  path: '/init-docs/tour/intro'
}]

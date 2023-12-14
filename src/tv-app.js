// import stuff
import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import "./tv-channel.js";
import "./course-title.js";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export class TvApp extends LitElement {
  // defaults
  constructor() {
    super();
    this.itemClick = this.itemClick.bind(this);
    this.activeContent = "";
    this.farthestIndex = 0;
    this.time = "";
    this.source = new URL('../assets/channels.json', import.meta.url).href;
    this.listings = [];
    this.id = "";
    this.selectedCourse = null;
    this.activeIndex = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.onloadeddata();
    this.loadState();
  }

  static get tag() {
    return 'tv-app';
  }
  static get properties() {
    return {
      name: { type: String },
      source: { type: String },
      id: { type: String },
      selectedCourse: { type: Object },
      listings: { type: Array },
      contents: { type: Array},
      activeIndex: { type: Number },
      activeContent: { type: String },
    };
  }
  static get styles() {
    return [
      css`
      :host {
        display: block;
        margin: 16px;
        padding: 16px;
      }

      .alignContent {
        display: flex;
        justify-content: flex-start;
        gap: 90px;
      }

      .course-topics {
        margin-left: -36px;
        margin-right: 1px;
        margin-top: 25px;
        position: fixed;
        padding-top: 8px;
        padding-right: 5px;
        display: flex;
        flex-direction: column;
        width: 275px;
      }

      .main {
        margin: 42px 141px 23px 386px;
        height: 100%;
        padding-top: 8px;
        padding-right: 5px;
        padding-bottom: 1px;
        padding-left: 20px;
        width: calc(100% - 291px);
        font-size: 1em;
        border: 1px solid #dadce0;
        border-radius: 5px;
        background-color: #f8f9fa;
        font: 400 16px/24px var(--devsite-primary-font-family);
        -webkit-font-smoothing: antialiased;
        text-size-adjust: 100%;
        color: #4e5256;
        font-family: var(--devsite-primary-font-family);
        background: #f8f9fa;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      .footer {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        position: fixed;
        bottom: 0;
        right: 0;
        margin: 19px;
        width: 81vw;
      }

      #previous > button {
        border-radius: 4px;
        font-family:
          Google Sans,
          Arial,
          sans-serif;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.6px;
        line-height: 24px;
        padding-bottom: 6px;
        padding-left: 24px;
        padding-right: 24px;
        padding-top: 6px;
        pointer-events: auto;
        text-transform: none;
        background: #fff;
        color: #1a73e8;
        border: 0;
        box-shadow:
          0 2px 2px 0 rgba(0, 0, 0, 0.14),
          0 1px 5px 0 rgba(0, 0, 0, 0.12),
          0 3px 1px -2px rgba(0, 0, 0, 0.2);
      }
      #next > button {
        border-radius: 4px;
        font-family:
          Google Sans,
          Arial,
          sans-serif;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.6px;
        line-height: 24px;
        padding-bottom: 6px;
        padding-left: 24px;
        padding-right: 24px;
        padding-top: 6px;
        pointer-events: auto;
        text-transform: none;
        background: #1a73e8;
        color: #fff;
        align : right;
        border: 0;
        box-shadow:
          0 2px 2px 0 rgba(0, 0, 0, 0.14),
          0 1px 5px 0 rgba(0, 0, 0, 0.12),
          0 3px 1px -2px rgba(0, 0, 0, 0.2);
      }
    `,
  ];
}
 
  render() {
    const isFirstCourse = this.activeIndex === 0;
    const isLastCourse = this.activeIndex === this.listings.length - 1;
    return html`
    <course-title time="${this.time}"> </course-title>
    <div class="alignContent">
      <div class="course-topics">
        ${this.listings.map(
          (item, index) => html`
            <tv-channel
              title="${item.title}"
              id="${item.id}"
              @click="${() => this.itemClick(index)}"
              activeIndex="${this.activeIndex}"
            >
            </tv-channel>
          `,
        )}
      </div>

      <div class="main">
        
        ${this.renderActiveContent()}
      </div>

      <div class="footer">
        <div id="previous" style="${isFirstCourse ? 'display: none;' : ''}">
          <button @click=${() => this.prevPage()}>Back</button>
        </div>
        <div id="next" style="${isLastCourse ? 'display: none; align: right;' : ''}">
          <button @click=${() => this.nextPage()}>Next</button>
        </div>
        </div>
      </div>
  `;
}

renderActiveContent() {
  if (!this.activeContent) {
    return html``; 
  }

  const template = document.createElement('template');
  template.innerHTML = this.activeContent;
  return html`${template.content}`;
}

loadState() {
  const storedActiveIndex = localStorage.getItem('activeIndex');
  const storedFarthestIndex = localStorage.getItem('farthestIndex');
  if (storedActiveIndex !== null && storedFarthestIndex !== null) {
    this.activeIndex = parseInt(storedActiveIndex, 10);
    this.farthestIndex = parseInt(storedFarthestIndex, 10);
    this.loadActiveContent();
  }
}

saveState() {
  localStorage.setItem('activeIndex', this.activeIndex);
  localStorage.setItem('farthestIndex', this.farthestIndex);

  
  if (this.activeIndex === this.listings.length - 1) {
    localStorage.removeItem('activeIndex');
    localStorage.removeItem('farthestIndex');
  }
}


async loadData() {
  await fetch(this.source)
    .then((resp) => (resp.ok ? resp.json() : []))
    .then((responseData) => {
      if (
        responseData.status === 200 &&
        responseData.data.items &&
        responseData.data.items.length > 0
      ) {
        this.listings = [...responseData.data.items];
        this.loadActiveContent();
      }
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
}


async nextPage() {
  if (this.activeIndex !== null) {
    const nextIndex = this.activeIndex + 1;
    const item = this.listings[nextIndex].location;

    const contentPath = "/assets/" + item;
    this.time = this.listings[nextIndex].metadata.timecode;

    try {
      const response = await fetch(contentPath);
      this.activeContent = await response.text();
      this.activeIndex = nextIndex; 
      this.saveState();
    } catch (err) {
      console.log("fetch failed", err);
    }
  }
}

async prevPage() {
  if (this.activeIndex !== null) {
    

    const prevIndex = this.activeIndex - 1; 

    const item = this.listings[prevIndex].location; 
    this.time = this.listings[prevIndex].metadata.timecode; 
    const contentPath = "/assets/" + item;

    try {
      const response = await fetch(contentPath);
      this.activeContent = await response.text();
      this.activeIndex = prevIndex; 
    } catch (err) {
      console.log("fetch failed", err);
    }
  }
}

  closeDialog(e) {
    const dialog = this.shadowRoot.querySelector('.dialog');
    dialog.hide();
  }

  async itemClick(index) {
    this.time = this.listings[index].metadata.timecode; 
    const contentPath = "/assets/" + item;
    this.activeIndex = index; 
    const item = this.listings[index].location; 

    try {
      const response = await fetch(contentPath);
      const text = await response.text();
      this.activeContent = text; 
      if (this.activeIndex > this.farthestIndex) {
        this.farthestIndex = this.activeIndex;
      }
      this.saveState();
    } catch (err) {
      console.log("fetch failed", err);
    }
  }

  firstUpdate(){
    this.activeIndex = 0;
  }



  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "source" && this[propName]) {
        this.updateSourceData(this[propName]);
      }
    });
  }

  loadActiveContent() {
    if (this.listings && this.listings.length > 0 && this.activeIndex >= 0 && this.activeIndex < this.listings.length) {
      const item = this.listings[this.activeIndex].location;
      const contentPath = "/assets/" + item;

      fetch(contentPath)
        .then((response) => response.text())
        .then((text) => {
          this.activeContent = text;
          this.time = this.listings[this.activeIndex].metadata.timecode;
        })
        .catch((error) => {
          console.error('Error fetching active content:', error);
        });
    }
  }

  
  async updateSourceData(source) {
    await fetch(source)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((responseData) => {
        if (
          responseData.status === 200 &&
          responseData.data.items &&
          responseData.data.items.length > 0
        ) {
          this.listings = [...responseData.data.items];
          console.log("Listings: ", this.listings);
        }
      });
  }
}

customElements.define(TvApp.tag, TvApp);
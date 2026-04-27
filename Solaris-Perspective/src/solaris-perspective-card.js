class SolarisPerspectiveCard extends HTMLElement {
    set hass(hass) {
        if (!this.content) {
            const card = document.createElement('ha-card');
            card.header = 'Solaris Perspective';
            this.content = document.createElement('div');
            this.content.style.padding = '0 16px 16px';
            this.content.innerHTML = `
                <p>Solaris-Perspective card is under construction.</p>
            `;
            card.appendChild(this.content);
            this.appendChild(card);
        }
        this._hass = hass;
    }

    setConfig(config) {
        if (!config.entity) {
            // throw new Error('You need to define an entity');
        }
        this.config = config;
    }

    getCardSize() {
        return 3;
    }
}

customElements.define('solaris-perspective-card', SolarisPerspectiveCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "solaris-perspective-card",
    name: "Solaris Perspective Card",
    description: "A comprehensive solar and energy dashboard card."
});
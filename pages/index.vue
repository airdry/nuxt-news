<template>
  <div class="md-layout md-alignment-center" style="margin: 4em 0">
    <!-- Top Navigation -->
    <md-toolbar class="fixed-toolbar" elevation="1">
      <md-button class="md-icon-button">
        <md-icon>menu</md-icon>
      </md-button>
      <nuxt-link class="md-primary md-title" to="/">
        NuxtNews
      </nuxt-link>

      <div class="md-toolbar-section-end">
        <md-button to="/login">Login</md-button>
        <md-button to="/register">Register</md-button>
      </div>
    </md-toolbar>

    <!-- App Content -->
    <div class="md-layout-item md-size-95">
      <md-content
        class="md-layout md-gutter"
        style="background: #007998; padding: 1em;"
      >
        <ul
          v-for="headline in headlines"
          :key="headline.id"
          class="md-layout-item md-large-size-25 md-medium-size-33 md-small-size-50 md-xsmall-size-100"
        >
          <md-card style="margin-top: 1em;" md-with-hover>
            <md-ripple>
              <md-card-media md-ratio="16:9">
                <img :src="headline.urlToImage" :alt="headline.title" />
              </md-card-media>

              <md-card-header>
                <div class="md-title">
                  <a :href="headline.url" target="_blank">{{
                    headline.title
                  }}</a>
                </div>
                <div>
                  {{ headline.source.name }}
                  <md-icon class="small-icon">book</md-icon>
                </div>
                <div class="md-subhead" v-if="headline.author">
                  {{ headline.author }}
                  <md-icon class="small-icon">face</md-icon>
                </div>
                <div class="md-subhead">
                  {{ headline.publishedAt }}
                  <md-icon class="small-icon">alarm</md-icon>
                </div>
              </md-card-header>

              <md-card-content>{{ headline.description }}</md-card-content>

              <md-card-actions>
                <md-button class="md-icon-button">
                  <md-icon>bookmark</md-icon>
                </md-button>
                <md-button class="md-icon-button">
                  <md-icon>message</md-icon>
                </md-button>
              </md-card-actions>
            </md-ripple>
          </md-card>
        </ul>
      </md-content>
    </div>
  </div>
</template>

<script>
export default {
  async fetch({ store }) {
    await store.dispatch("loadHeadlines", "/api/top-headlines?country=us");
  },
  computed: {
    headlines() {
      return this.$store.getters.headlines;
    }
  }
};
</script>

<style scoped>
.small-icon {
  font-size: 18px !important;
}

.fixed-toolbar {
  position: fixed;
  top: 0;
  z-index: 5;
}
</style>

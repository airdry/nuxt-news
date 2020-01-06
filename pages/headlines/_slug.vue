<template>
  <div class="md-layout md-alignment-center" style="margin: 5em 0">
    <div class="md-layout-item md-size-75 md-small-size-80 md-xsmall-size-100">
      <!-- Headline Markup -->
      <md-card>
        <md-card-media style="height: 300px" md-ratio="16:9">
          <img :src="headline.urlToImage" :alt="headline.title" />
        </md-card-media>

        <md-card-header>
          <div class="md-title">
            <a :href="headline.url" target="_blank">{{ headline.title }}</a>
          </div>
          <div>
            {{ headline.source.name }}
            <md-icon>book</md-icon>
          </div>
          <span class="md-subhead" v-if="headline.author">
            {{ headline.author }}
            <md-icon>face</md-icon>
          </span>
        </md-card-header>

        <md-card-content>{{ headline.content }}</md-card-content>
      </md-card>

      <!-- Comment Form -->
      <form @submit.prevent="sendComment">
        <md-field>
          <label>Enter your comment</label>
          <md-textarea
            v-model="text"
            :disabled="loading || !user"
          ></md-textarea>
          <md-icon>description</md-icon>
        </md-field>
        <md-button
          class="md-primary md-raised"
          type="submit"
          :disabled="loading || !user"
          >Send Comment</md-button
        >
      </form>

      <!-- Comments -->
      <md-list class="md-triple-line" style="margin-top: 1em">
        <md-list-item v-for="comment in headline.comments" :key="comment.id">
          <md-avatar
            ><img :src="comment.user.avatar" :alt="comment.user.username"
          /></md-avatar>
          <div class="md-list-item-text">
            <span>{{ comment.user.username }}</span>
            <span>{{ comment.publishedAt | commentTimeToNow }}</span>
            <p>{{ comment.text }}</p>
          </div>

          <md-badge
            class="md-primary"
            md-position="bottom"
            :md-content="comment.likes"
          />
          <md-button
            @click="likeComment(comment.id)"
            class="md-icon-button"
            :disabled="loading || !user"
          >
            <md-icon>thumb_up</md-icon>
          </md-button>
        </md-list-item>
      </md-list>

      <!-- Back Button -->
      <md-button
        class="md-fixed md-fab-bottom-right md-fab md-primary"
        @click="$router.go(-1)"
      >
        <md-icon>arrow_back</md-icon>
      </md-button>
    </div>
  </div>
</template>

<script>
import uuidv4 from "uuid/v4";

export default {
  data: () => ({
    text: ""
  }),
  async fetch({ store, params }) {
    await store.dispatch("loadHeadline", params.slug);
  },
  computed: {
    headline() {
      return this.$store.getters.headline;
    },
    loading() {
      return this.$store.getters.loading;
    },
    user() {
      return this.$store.getters.user;
    }
  },
  methods: {
    async sendComment() {
      const comment = {
        id: uuidv4(),
        text: this.text,
        user: this.getCommentUserData(),
        publishedAt: Date.now(),
        likes: 0
      };
      await this.$store.dispatch("sendComment", comment);
      this.text = "";
    },
    async likeComment(commentId) {
      await this.$store.dispatch("likeComment", commentId);
    },
    getCommentUserData() {
      const commentUserData = { ...this.user };
      commentUserData["username"] = commentUserData["email"].split("@")[0];
      return commentUserData;
    }
  }
};
</script>

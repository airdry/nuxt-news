import Vuex from "vuex";
import md5 from "md5";
import slugify from "slugify";
import db from "~/plugins/firestore";
import { saveUserData, clearUserData } from "~/utils";

const createStore = () => {
  return new Vuex.Store({
    state: {
      headlines: [],
      headline: null,
      feed: [],
      loading: false,
      token: "",
      user: null,
      category: "",
      country: "us"
    },
    mutations: {
      setHeadlines(state, headlines) {
        state.headlines = headlines;
      },
      setHeadline(state, headline) {
        state.headline = headline;
      },
      setLoading(state, loading) {
        state.loading = loading;
      },
      setToken(state, token) {
        state.token = token;
      },
      setUser(state, user) {
        state.user = user;
      },
      setCategory(state, category) {
        state.category = category;
      },
      setCountry(state, country) {
        state.country = country;
      },
      setFeed(state, headlines) {
        state.feed = headlines;
      },
      clearToken: state => (state.token = ""),
      clearUser: state => (state.user = null),
      clearFeed: state => (state.feed = [])
    },
    actions: {
      async loadHeadlines({ commit }, apiUrl) {
        commit("setLoading", true);
        const { articles } = await this.$axios.$get(apiUrl);
        const headlines = articles.map(article => {
          const slug = slugify(article.title, {
            replacement: "-",
            remove: /[^a-zA-Z0-9 -]/g,
            lower: true
          });
          const headline = { ...article, slug };
          return headline;
        });
        commit("setLoading", false);
        commit("setHeadlines", headlines);
      },
      async addHeadlineToFeed({ state }, headline) {
        const feedRef = db
          .collection(`users/${state.user.email}/feed`)
          .doc(headline.title);

        await feedRef.set(headline);
      },
      async loadUserFeed({ state, commit }) {
        if (state.user) {
          const feedRef = db.collection(`users/${state.user.email}/feed`);

          await feedRef.onSnapshot(querySnapshot => {
            let headlines = [];
            querySnapshot.forEach(doc => {
              headlines.push(doc.data());
              commit("setFeed", headlines);
            });

            if (querySnapshot.empty) {
              headlines = [];
              commit("setFeed", headlines);
            }
          });
        }
      },
      async loadHeadline({ commit }, headlineSlug) {
        const headlineRef = db.collection("headlines").doc(headlineSlug);
        const commentsRef = db
          .collection(`headlines/${headlineSlug}/comments`)
          .orderBy("likes", "desc");

        let loadedHeadline = {};
        await headlineRef.get().then(async doc => {
          if (doc.exists) {
            loadedHeadline = doc.data();

            await commentsRef.get().then(querySnapshot => {
              if (querySnapshot.empty) {
                commit("setHeadline", loadedHeadline);
              }
              let loadedComments = [];
              querySnapshot.forEach(doc => {
                loadedComments.push(doc.data());
                loadedHeadline["comments"] = loadedComments;
                commit("setHeadline", loadedHeadline);
              });
            });
          }
        });
      },
      async sendComment({ state, commit }, comment) {
        const commentsRef = db.collection(
          `headlines/${state.headline.slug}/comments`
        );

        commit("setLoading", true);
        await commentsRef.doc(comment.id).set(comment);
        await commentsRef
          .orderBy("likes", "desc")
          .get()
          .then(querySnapshot => {
            let comments = [];
            querySnapshot.forEach(doc => {
              comments.push(doc.data());
              const updatedHeadline = { ...state.headline, comments };
              commit("setHeadline", updatedHeadline);
            });
          });
        commit("setLoading", false);
      },
      async likeComment({ state, commit }, commentId) {
        const commentsRef = db
          .collection(`headlines/${state.headline.slug}/comments`)
          .orderBy("likes", "desc");
        const likedCommentRef = db
          .collection("headlines")
          .doc(state.headline.slug)
          .collection("comments")
          .doc(commentId);

        await likedCommentRef.get().then(doc => {
          if (doc.exists) {
            const prevLikes = doc.data().likes;
            const currentLikes = prevLikes + 1;
            likedCommentRef.update({
              likes: currentLikes
            });
          }
        });

        await commentsRef.onSnapshot(querySnapshot => {
          let loadedComments = [];
          querySnapshot.forEach(doc => {
            loadedComments.push(doc.data());
            const updatedHeadline = {
              ...state.headline,
              comments: loadedComments
            };
            commit("setHeadline", updatedHeadline);
          });
        });
      },
      async saveHeadline(context, headline) {
        const headlineRef = db.collection("headlines").doc(headline.slug);

        let headlineId;
        await headlineRef.get().then(doc => {
          if (doc.exists) {
            headlineId = doc.id;
          }
        });

        if (!headlineId) {
          await headlineRef.set(headline);
        }
      },
      async removeHeadlineFromFeed({ state }, headline) {
        const headlineRef = db
          .collection(`users/${state.user.email}/feed`)
          .doc(headline.title);

        await headlineRef.delete();
      },
      async authenticateUser({ commit }, userPayload) {
        try {
          commit("setLoading", true);
          const authUserData = await this.$axios.$post(
            `/${userPayload.action}/`,
            {
              email: userPayload.email,
              password: userPayload.password,
              returnSecureToken: userPayload.returnSecureToken
            }
          );
          let user;
          if (userPayload.action === "register") {
            const avatar = `http://gravatar.com/avatar/${md5(
              authUserData.email
            )}?d=identicon`;
            user = { email: authUserData.email, avatar };
            await db
              .collection("users")
              .doc(userPayload.email)
              .set(user);
          } else {
            const loginRef = db.collection("users").doc(userPayload.email);
            const loggedInUser = await loginRef.get();
            user = loggedInUser.data();
          }
          commit("setUser", user);
          commit("setToken", authUserData.idToken);
          commit("setLoading", false);
          saveUserData(authUserData, user);
        } catch (err) {
          console.error(err);
          commit("setLoading", false);
        }
      },
      setLogoutTimer({ dispatch }, interval) {
        setTimeout(() => dispatch("logoutUser"), interval);
      },
      logoutUser({ commit }) {
        commit("clearToken");
        commit("clearUser");
        commit("clearFeed");
        clearUserData();
      }
    },
    getters: {
      headlines: state => state.headlines,
      headline: state => state.headline,
      feed: state => state.feed,
      loading: state => state.loading,
      user: state => state.user,
      isAuthenticated: state => !!state.token,
      category: state => state.category,
      country: state => state.country
    }
  });
};

export default createStore;

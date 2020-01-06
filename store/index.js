import Vuex from "vuex";
import md5 from "md5";
import db from "~/plugins/firestore";
import { saveUserData, clearUserData } from "~/utils";

const createStore = () => {
  return new Vuex.Store({
    state: {
      headlines: [],
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
        commit("setLoading", false);
        commit("setHeadlines", articles);
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

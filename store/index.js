import Vuex from "vuex";
import md5 from "md5";
import db from "~/plugins/firestore";

const createStore = () => {
  return new Vuex.Store({
    state: {
      headlines: [],
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
      }
    },
    actions: {
      async loadHeadlines({ commit }, apiUrl) {
        commit("setLoading", true);
        const { articles } = await this.$axios.$get(apiUrl);
        commit("setLoading", false);
        commit("setHeadlines", articles);
      },
      async authenticateUser({ commit }, userPayload) {
        try {
          commit("setLoading", true);
          const authUserData = await this.$axios.$post(
            "/register/",
            userPayload
          );
          const avatar = `http://gravatar.com/avatar/${md5(
            authUserData.email
          )}?d=identicon`;
          const user = { email: authUserData.email, avatar };
          await db
            .collection("users")
            .doc(userPayload.email)
            .set(user);
          commit("setUser", user);
          commit("setToken", authUserData.idToken);
          commit("setLoading", false);
        } catch (err) {
          console.error(err);
          commit("setLoading", false);
        }
      }
    },
    getters: {
      headlines: state => state.headlines,
      loading: state => state.loading,
      user: state => state.user,
      isAuthenticated: state => !!state.token,
      category: state => state.category,
      country: state => state.country
    }
  });
};

export default createStore;

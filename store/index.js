import Vuex from "vuex";

const createStore = () => {
  return new Vuex.Store({
    state: {
      headlines: []
    },
    mutations: {
      setHeadlines(state, headlines) {
        state.headlines = headlines;
      }
    },
    actions: {
      async loadHeadlines({ commit }, apiUrl) {
        const { articles } = await this.$axios.$get(apiUrl);
        commit("setHeadlines", articles);
      }
    },
    getters: {
      headlines: state => state.headlines
    }
  });
};

export default createStore;

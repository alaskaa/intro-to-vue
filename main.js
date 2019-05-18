var eventBus = new Vue();

// grandchildren can't communicate with their grandparent, so we need an event bus to solve this problem

Vue.component("product", {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: `
  <div class="product">
  <div class="product-image">
    <a :href="href" :target="target">
      <img v-bind:src="image" />
      <!-- v-bind dynmically binds an attribute (here src) to an expression (here image) -->
      <!-- v-bind so common, so can say :src :href :title ...-->
    </a>
  </div>
  <div class="product-info">
    <h1>{{ title }}</h1>
    <p v-if="inStock">In Stock</p>
    <p v-else :class="{outOfStock: !inStock}">Out of Stock</p>
    <span v-if="onSale">On Sale!</span>
    <p>User is premium: {{premium}} </p>
    <p>Shipping: {{shipping}} </p>

    <ul>
      <!-- for each item in data collection, return item -->
      <li v-for="detail in details">
        {{ detail }}
      </li>
    </ul>
    <div
      v-for="(variant, index) in variants"
      :key="variant.variantId"
      class="color-box"
      :style="{backgroundColor: variant.variantColor }"
      @mouseover="updateProduct(index)"
    >
      <!-- v-on="" shorthand is @ -->
    </div>
    <div>
      <p v-for="size in sizes">
        {{ size }}
      </p>
    </div>
    <button
      @click="addToCart"
      :disabled="!inStock"
      :class="{disabledButton: !inStock}"
    >
      Add to Cart
    </button>
    <button @click="removeFromCart">Remove from Cart</button>
  </div>

  <product-tabs :reviews="reviews"></product-tabs>
</div>
  `,
  data() {
    return {
      brand: "Vue Mastery",
      product: "Socks",
      description: "lovely banging socks",
      selectedVariant: 0,
      href: "https://www.vuemastery.com",
      target: "_blank",
      onSale: false,
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      variants: [
        {
          variantId: 2234,
          variantColor: "green",
          variantImage: "./assets/vmSocks-green-onWhite.jpg",
          variantQuantity: 10
        },
        {
          variantId: 2235,
          variantColor: "blue",
          variantImage: "./assets/vmSocks-blue-onWhite.jpg",
          variantQuantity: 0
        }
      ],
      reviews: [],
      sizes: ["S", "M", "L", "XL"]
    };
  },
  methods: {
    addToCart() {
      this.$emit("add-to-cart", this.variants[this.selectedVariant].variantId);
    },
    removeFromCart() {
      this.$emit("remove-from-cart");
    },
    updateProduct(index) {
      this.selectedVariant = index;
    }
  },
  computed: {
    title() {
      return this.brand + " " + this.product;
    },
    image() {
      return this.variants[this.selectedVariant].variantImage;
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity;
    },
    shipping() {
      if (this.premium) {
        return "Free";
      }
      return 2.99;
    }
  },
  mounted() {
    eventBus.$on("review-submitted", productReview => {
      this.reviews.push(productReview);
    });
  }
});

Vue.component("product-review", {
  props: {},
  template: `
  <!-- .prevent prevents the default behaviour of refreshing the page -->
  <form class="review-form" @submit.prevent="onSubmit">
    <p v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="error in errors">
          {{error}}
        </li>
      </ul>
    </p>

    <p>
      <label for="name">Name:</label>
      <!-- v-model enables two directional data binding for us, updating the form value and the value in our data -->
      <input id="name" v-model="name">
    </p>

    <p>
      <label for="review">Review:</label>
      <textarea id="review" v-model="review"></textarea>
    </p>

    <p>
      <label for="review">Rating:</label>
      <!-- v-model.number ensures that we typecast this a number -->
      <select id="rating" v-model.number="rating">
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
      </select>
    </p>

    <p>Would you recommend this product?</p>
    <p>
      <input type="radio" id="choice1" name="recommend" value="yes" v-model="recommend">
      <label for="choice1">Yes</label>
    </p>
    <p>
      <input type="radio" id="choice2" name="recommend" value="no" v-model="recommend">
      <label for="choice2">No</label>
    </p>
    <p>
      <input type="submit" value="Submit">
    </p>
  </form>

 
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: []
    };
  },
  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating && this.recommend) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
        };
        eventBus.$emit("review-submitted", productReview);
        this.name = null;
        this.review = null;
        this.rating = null;
        this.recommend = null;
      } else {
        if (!this.name) this.errors.push("Name required.");
        if (!this.review) this.errors.push("Review required.");
        if (!this.rating) this.errors.push("Rating required.");
        if (!this.recommend)
          this.errors.push("Answer for recommendation required.");
      }
    }
  }
});

Vue.component("product-tabs", {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
      <span class="tab"
      :class="{activeTab: selectedTab === tab}"
      v-for="(tab, index) in tabs" 
      :key="index"
      @click="selectedTab = tab"
      >
      {{tab}}
      </span>

      <div v-show="selectedTab === 'Reviews'">
        <h2>Reviews</h2>
          <p v-if="!reviews.length">There are no reviews yet</p>
          <ul>
            <li v-for="review in reviews">
            <p>Name: {{review.name}}</p>
            <p>Rating: {{review.rating}}</p>
            <p>{{review.review}}</p>
            <p>Would you recommend this product? Answer: {{review.recommend}}</p>
            </li>
          </ul>
      </div>

      <product-review v-show="selectedTab === 'Make a Review'"></product-review>
    </div>


  `,
  data() {
    return {
      tabs: ["Reviews", "Make a Review"],
      selectedTab: "Reviews"
    };
  }
});

var app = new Vue({
  // this creates a new Vue instance (root of application)
  el: "#app", // plug into this
  data: {
    premium: true,
    cart: []
  },
  methods: {
    updateCart(id) {
      this.cart.push(id);
    },
    removeCart(id) {
      this.cart.pop(id);
    }
  }
  // passing an object into it to fill with info
});

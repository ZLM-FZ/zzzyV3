import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import "element-ui/lib/theme-chalk/index.css";
import {
  Input,
  Button,
  Form,
  FormItem,
  Row,
  Col,
  Message,
  Dialog,
  Checkbox,
  CheckboxGroup,
  Upload,
  Tabs,
  Divider,
  TabPane,
  Table,
  TableColumn,
  Card,
  Switch,
  Alert,
  Collapse,
  CollapseItem
} from "element-ui";
import JsonExcel from "vue-json-excel";

Vue.config.productionTip = false;

Vue.use(Input);
Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Col);
Vue.use(Row);
Vue.use(Dialog);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Upload);
Vue.use(Tabs);
Vue.use(Divider);
Vue.use(TabPane);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Card);
Vue.use(Switch);
Vue.use(Alert);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.prototype.$message = Message;
Vue.component("downloadExcel", JsonExcel);

// https://seller.shopee.cn/api/v3/order/get_shipment_order_list_by_order_ids_multi_shop?SPC_CDS

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

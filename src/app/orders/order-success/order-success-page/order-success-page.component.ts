import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@core/auth/auth.service";
import { Order } from "@core/orders/order";
import { getOrderById } from "@core/orders/order.selector";
import { OrderService } from "@core/orders/order.service";
import { OrderStore } from "@core/orders/order.store";
import { Observable, Subscription } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Component({
  selector: "pm-order-success-page",
  templateUrl: "./order-success-page.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSuccessPageComponent implements OnInit {
  order: Order;
  orderSubscription: Subscription;
  orderId$: Observable<string>;
  fetchOrderFromServer$: Observable<string>;
  fetchOrderFromStore$: Observable<Order>;
  constructor(
    private route: ActivatedRoute,
    private orderStore: OrderStore,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    this.orderId$ = this.route.params.pipe(map((params) => params.id));

    this.fetchOrderFromServer$ = this.orderId$.pipe(
      switchMap((orderId) => this.orderService.getOrder(orderId))
    );

    this.fetchOrderFromStore$ = this.fetchOrderFromServer$.pipe(
      switchMap((orderId: string) =>
        this.orderStore.select(getOrderById(orderId))
      )
    );
  }

  ngOnInit() {
    this.orderSubscription = this.fetchOrderFromStore$.subscribe(
      (order: Order) => this.handleOrder(order)
    );
  }

  ngOnDestroy(): void {
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
  }

  get user() {
    return this.authService.loggedInUser;
  }

  handleOrder(order: Order) {
    this.order = order;
    if (!this.order) {
      this.navigateToShoppingPage();
    }
    this.cdRef.detectChanges();
  }

  navigateToOrderDetailPage(orderId: string) {
    this.router.navigate(["../../order-details", this.order.orderId], {
      relativeTo: this.route,
    });
  }

  navigateToShoppingPage() {
    this.router.navigate(["../../../products"], { relativeTo: this.route });
  }
}


DROP POLICY IF EXISTS "insert any notif" ON public.notifications;
CREATE POLICY "insert notifs scoped" ON public.notifications FOR INSERT WITH CHECK (
  -- user can insert a notif targeted to themselves (e.g. local marker)
  auth.uid() = user_id
  -- a provider can notify the customer of an order they own
  OR EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.providers p ON p.id = o.provider_id
    WHERE o.id = notifications.related_order_id
      AND p.user_id = auth.uid()
      AND notifications.user_id = o.user_id
  )
  -- a customer can notify the provider of their own order (e.g. new order)
  OR EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.providers p ON p.id = o.provider_id
    WHERE o.id = notifications.related_order_id
      AND o.user_id = auth.uid()
      AND notifications.user_id = p.user_id
  )
  OR public.has_role(auth.uid(),'admin')
);

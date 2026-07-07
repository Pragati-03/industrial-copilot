import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

type AvatarRootProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>;
type AvatarImageProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>;
type AvatarFallbackProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>;

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarRootProps>(
  function Avatar(props, ref) {
    const { className, ...rest } = props;
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn("relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full", className)}
        {...rest}
      />
    );
  }
);

const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, AvatarImageProps>(
  function AvatarImage(props, ref) {
    const { className, ...rest } = props;
    return <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...rest} />;
  }
);

const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, AvatarFallbackProps>(
  function AvatarFallback(props, ref) {
    const { className, ...rest } = props;
    return (
      <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground",
          className
        )}
        {...rest}
      />
    );
  }
);

export { Avatar, AvatarImage, AvatarFallback };
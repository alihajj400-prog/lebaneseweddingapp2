 import { ReactNode } from 'react';
 import { motion } from 'framer-motion';
 import { LucideIcon } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Link } from 'react-router-dom';
 
 interface EmptyStateProps {
   icon: LucideIcon;
   title: string;
   description: string;
   action?: {
     label: string;
     href?: string;
     onClick?: () => void;
   };
   secondaryAction?: {
     label: string;
     href?: string;
     onClick?: () => void;
   };
   children?: ReactNode;
 }
 
 export function EmptyState({
   icon: Icon,
   title,
   description,
   action,
   secondaryAction,
   children,
 }: EmptyStateProps) {
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="text-center py-12 px-4"
     >
       <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
         <Icon className="w-8 h-8 text-muted-foreground/50" />
       </div>
       <h3 className="font-serif text-xl font-medium text-foreground mb-2">
         {title}
       </h3>
       <p className="text-muted-foreground max-w-sm mx-auto mb-6">
         {description}
       </p>
       {(action || secondaryAction) && (
         <div className="flex flex-col sm:flex-row gap-3 justify-center">
           {action && (
             action.href ? (
               <Link to={action.href}>
                 <Button>{action.label}</Button>
               </Link>
             ) : (
               <Button onClick={action.onClick}>{action.label}</Button>
             )
           )}
           {secondaryAction && (
             secondaryAction.href ? (
               <Link to={secondaryAction.href}>
                 <Button variant="outline">{secondaryAction.label}</Button>
               </Link>
             ) : (
               <Button variant="outline" onClick={secondaryAction.onClick}>
                 {secondaryAction.label}
               </Button>
             )
           )}
         </div>
       )}
       {children}
     </motion.div>
   );
 }
 import { motion } from 'framer-motion';
 import { AlertCircle, RefreshCw } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 interface ErrorStateProps {
   title?: string;
   message?: string;
   onRetry?: () => void;
 }
 
 export function ErrorState({
   title = 'Something went wrong',
   message = 'We encountered an error while loading your data. Please try again.',
   onRetry,
 }: ErrorStateProps) {
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="text-center py-12 px-4"
     >
       <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
         <AlertCircle className="w-8 h-8 text-destructive" />
       </div>
       <h3 className="font-serif text-xl font-medium text-foreground mb-2">
         {title}
       </h3>
       <p className="text-muted-foreground max-w-sm mx-auto mb-6">
         {message}
       </p>
       {onRetry && (
         <Button onClick={onRetry} variant="outline" className="gap-2">
           <RefreshCw className="w-4 h-4" />
           Try Again
         </Button>
       )}
     </motion.div>
   );
 }
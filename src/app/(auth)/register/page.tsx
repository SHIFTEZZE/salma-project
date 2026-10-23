import { signUp } from '@/lib/actions/auth';
export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-sm border border-gray-100">
      <h1 className="text-2xl font-serif text-center mb-6">Create Seller Account</h1>
      <form action={signUp} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Full Name</label><input name="display_name" type="text" required className="input-field" /></div>
        <div><label className="block text-sm font-medium mb-1">Email</label><input name="email" type="email" required className="input-field" /></div>
        <div><label className="block text-sm font-medium mb-1">Password (min 6 chars)</label><input name="password" type="password" required minLength={6} className="input-field" /></div>
        <button type="submit" className="btn-primary w-full">Create Account</button>
      </form>
      <p className="text-center text-sm mt-4 text-gray-600">Already have an account? <a href="/login" className="text-[var(--primary)] underline">Login</a></p>
    </div>
  );
}
